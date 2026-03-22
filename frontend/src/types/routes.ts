export type RouteStatus = 'draft' | 'published' | 'archived';
export type RouteDifficulty = 'easy' | 'moderate' | 'challenging';
export type StopMarkerIcon = 'location' | 'museum' | 'culture' | 'history' | 'nature' | 'food' | 'accommodation';
export type ContentBlockType = 'text' | 'image' | 'video' | 'audio' | 'quote' | 'fact' | 'story_link' | 'testimony_link';

export interface Route {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  // Duration/distance
  duration_minutes: number | null;
  estimated_hours: number | null;
  difficulty: RouteDifficulty;
  distance_km: number | null;
  // Classification
  transport_mode: string[] | null;
  access_level: 'free' | 'premium' | 'sponsored';
  category: string | null;
  sensitivity_level: string | null;
  offline_available: boolean;
  // Status
  status: RouteStatus;
  created_by: string | null;
  published_at: string | null;
  // Populated stops (when depth ≥ 2)
  stops: RouteStop[];
}

export interface RouteStop {
  id: string;
  route_id: string;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  stop_order: number;
  estimated_time_minutes: number;
  autoplay_on_arrival: boolean;
  marker_color: string;
  marker_icon: StopMarkerIcon;
  // Linked content (populated relationships)
  linked_story_id: string | null;
  linked_testimony_id: string | null;
  // Embedded content blocks
  content_blocks: StopContentBlock[];
}

export interface StopContentBlock {
  id: string;
  stop_id: string;
  block_type: ContentBlockType;
  block_order: number;
  content: ContentBlockData;
}

// Content block data types
export interface TextBlockContent {
  text: string;
  highlights?: { start: number; end: number; color: string }[];
}

export interface ImageBlockContent {
  images: { url: string; caption?: string }[];
  layout?: 'single' | 'gallery' | 'grid';
}

export interface VideoBlockContent {
  url: string;
  caption?: string;
  autoplay?: boolean;
  thumbnail?: string;
}

export interface AudioBlockContent {
  url: string;
  title?: string;
  transcript?: string;
  playOnArrival?: boolean;
}

export interface QuoteBlockContent {
  quote: string;
  attribution: string;
  year?: string;
}

export interface FactBlockContent {
  title: string;
  fact: string;
  icon?: string;
}

export interface StoryLinkContent {
  storyId: string;
  storyTitle?: string;
}

export interface TestimonyLinkContent {
  testimonyId: string;
  testimonyTitle?: string;
}

export type ContentBlockData = 
  | TextBlockContent 
  | ImageBlockContent 
  | VideoBlockContent 
  | AudioBlockContent 
  | QuoteBlockContent 
  | FactBlockContent
  | StoryLinkContent
  | TestimonyLinkContent;

export interface RouteWithStops extends Route {
  stops: RouteStop[];
}

export interface RouteVersion {
  id: string;
  route_id: string;
  version_number: number;
  changes_summary: string | null;
  snapshot: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
}

export interface RouteComment {
  id: string;
  route_id: string;
  stop_id: string | null;
  block_id: string | null;
  user_id: string;
  comment: string;
  resolved: boolean;
  created_at: string;
}
