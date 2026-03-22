-- Muraho Rwanda — Database Init v3
-- Extensions + spatial views + RAG search + indexes
-- Runs once on first docker-compose up

-- Try to enable pgvector if the image has it
DO $$
BEGIN
  BEGIN
    CREATE EXTENSION IF NOT EXISTS vector;
  EXCEPTION
    WHEN undefined_file THEN
      RAISE NOTICE 'pgvector extension is unavailable in this image; vector features will be skipped';
  END;
END
$$;

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add vector column to Payload's content_embeddings table after migration (if both table and extension exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'content_embeddings' AND column_name = 'embedding'
    ) THEN
      BEGIN
        EXECUTE 'ALTER TABLE content_embeddings ADD COLUMN IF NOT EXISTS embedding vector(1024)';
      EXCEPTION
        WHEN undefined_table THEN
          RAISE NOTICE 'content_embeddings not yet created by Payload';
      END;
    END IF;
  END IF;
END
$$;

-- Indexes for embeddings, text, content, and status (idempotent)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_embeddings' AND column_name = 'embedding'
  ) THEN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_emb_hnsw ON content_embeddings USING hnsw (embedding vector_cosine_ops) WITH (m=16, ef_construction=200)';
    END IF;

    CREATE INDEX IF NOT EXISTS idx_emb_trgm ON content_embeddings USING gin (text_content gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS idx_emb_content ON content_embeddings (content_id, content_type);
    CREATE INDEX IF NOT EXISTS idx_emb_status ON content_embeddings (embedding_status);
  END IF;
END
$$;

-- Materialized view refresher: all spatial points as PostGIS geometries
CREATE OR REPLACE FUNCTION refresh_spatial_points() RETURNS void AS $$
BEGIN
  DROP MATERIALIZED VIEW IF EXISTS spatial_points;

  CREATE MATERIALIZED VIEW spatial_points AS
    SELECT
      id::text AS point_id,
      'museum'  AS point_type,
      name      AS title,
      slug,
      latitude,
      longitude,
      ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) AS geom,
      'museum' AS icon,
      '#7C3AED' AS color
    FROM museums
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND is_active = true

    UNION ALL

    SELECT
      id::text,
      'location',
      name,
      slug,
      latitude,
      longitude,
      ST_SetSRID(ST_MakePoint(longitude, latitude), 4326),
      COALESCE(location_type, 'location'),
      '#059669'
    FROM locations
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND is_active = true

    UNION ALL

    SELECT
      id::text,
      'route_stop',
      title,
      NULL,
      latitude,
      longitude,
      ST_SetSRID(ST_MakePoint(longitude, latitude), 4326),
      COALESCE(marker_icon,  'location'),
      COALESCE(marker_color, '#F97316')
    FROM route_stops
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL

    UNION ALL

    SELECT
      id::text,
      'outdoor_stop',
      title,
      NULL,
      latitude,
      longitude,
      ST_SetSRID(ST_MakePoint(longitude, latitude), 4326),
      COALESCE(marker_icon,  'memorial'),
      COALESCE(marker_color, '#4B5573')
    FROM museum_outdoor_stops
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND is_active = true
  ;

  CREATE INDEX IF NOT EXISTS idx_spatial_geom ON spatial_points USING GIST (geom);
  CREATE INDEX IF NOT EXISTS idx_spatial_type ON spatial_points (point_type);
END;
$$ LANGUAGE plpgsql;

-- Nearby points (radius search, kilometers)
CREATE OR REPLACE FUNCTION nearby_points(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 5.0,
  point_types TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  point_id   TEXT,
  point_type TEXT,
  title      TEXT,
  slug       TEXT,
  latitude   DOUBLE PRECISION,
  longitude  DOUBLE PRECISION,
  icon       TEXT,
  color      TEXT,
  distance_km DOUBLE PRECISION
)
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.point_id, sp.point_type, sp.title, sp.slug,
    sp.latitude, sp.longitude, sp.icon, sp.color,
    ST_DistanceSphere(sp.geom, ST_SetSRID(ST_MakePoint(lng, lat), 4326)) / 1000.0 AS distance_km
  FROM spatial_points sp
  WHERE ST_DWithin(
          sp.geom::geography,
          ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
          radius_km * 1000
        )
    AND (point_types IS NULL OR sp.point_type = ANY(point_types))
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- Bounding box points (map viewport)
CREATE OR REPLACE FUNCTION bbox_points(
  south DOUBLE PRECISION,
  west  DOUBLE PRECISION,
  north DOUBLE PRECISION,
  east  DOUBLE PRECISION,
  point_types TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  point_id   TEXT,
  point_type TEXT,
  title      TEXT,
  slug       TEXT,
  latitude   DOUBLE PRECISION,
  longitude  DOUBLE PRECISION,
  icon       TEXT,
  color      TEXT
)
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.point_id, sp.point_type, sp.title, sp.slug,
    sp.latitude, sp.longitude, sp.icon, sp.color
  FROM spatial_points sp
  WHERE sp.geom && ST_MakeEnvelope(west, south, east, north, 4326)
    AND (point_types IS NULL OR sp.point_type = ANY(point_types));
END;
$$ LANGUAGE plpgsql;

-- Create RAG search function if pgvector is available
DO $outer$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    BEGIN
      EXECUTE $ddl$
        CREATE OR REPLACE FUNCTION search_embeddings(
          query_embedding vector(1024),
          match_count INT DEFAULT 5,
          similarity_threshold FLOAT DEFAULT 0.3,
          filter_type TEXT DEFAULT NULL
        )
        RETURNS TABLE (
          id BIGINT,
          content_id TEXT,
          content_type TEXT,
          text_content TEXT,
          metadata JSONB,
          similarity FLOAT
        )
        LANGUAGE plpgsql
        AS $func$
        BEGIN
          RETURN QUERY
            SELECT
              ce.id,
              ce.content_id,
              ce.content_type,
              ce.text_content,
              ce.metadata,
              1 - (ce.embedding <=> query_embedding) AS similarity
            FROM content_embeddings ce
            WHERE ce.embedding IS NOT NULL
              AND ce.embedding_status = 'completed'
              AND (filter_type IS NULL OR ce.content_type = filter_type)
              AND 1 - (ce.embedding <=> query_embedding) > similarity_threshold
            ORDER BY ce.embedding <=> query_embedding
            LIMIT match_count;
        END;
        $func$;
      $ddl$;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Could not create search_embeddings function: %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'Skipping search_embeddings(): pgvector extension is unavailable';
  END IF;
END
$outer$;

-- Payload table indexes (idempotent, runs after Payload migration)
DO $$
BEGIN
  BEGIN CREATE INDEX IF NOT EXISTS idx_stories_pub   ON stories        (status) WHERE status = 'published'; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN CREATE INDEX IF NOT EXISTS idx_routes_pub    ON routes         (status) WHERE status = 'published'; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN CREATE INDEX IF NOT EXISTS idx_museums_act   ON museums        (is_active) WHERE is_active = true;  EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN CREATE INDEX IF NOT EXISTS idx_locs_act      ON locations      (is_active) WHERE is_active = true;  EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN CREATE INDEX IF NOT EXISTS idx_uca_user      ON user_content_access (user_id, access_type);         EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN CREATE INDEX IF NOT EXISTS idx_codes_agency  ON access_codes   (agency_id) WHERE is_active = true;  EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN CREATE INDEX IF NOT EXISTS idx_subs_user     ON subscriptions  (user_id, status);                   EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN CREATE INDEX IF NOT EXISTS idx_progress_user ON user_progress  (user_id, content_type);             EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN CREATE INDEX IF NOT EXISTS idx_saved_user    ON user_saved_items (user_id);                          EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN CREATE INDEX IF NOT EXISTS idx_ai_conv       ON ai_conversations (user_id, created_at DESC);        EXCEPTION WHEN undefined_table THEN NULL; END;
END
$$;