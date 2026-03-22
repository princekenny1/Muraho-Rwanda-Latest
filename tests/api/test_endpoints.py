"""
Muraho Rwanda — API Integration Tests
=======================================
Tests all custom Payload endpoints + AI service routes.

Run: pytest tests/api/ -v
Requires: Running docker-compose stack (postgres, redis, payload, ai-service)

Set TEST_API_URL=http://localhost:3000/api for local testing.
"""

import os
import json
import pytest
import httpx
from typing import AsyncGenerator

BASE_URL = os.getenv("TEST_API_URL", "http://localhost:3000/api")
AI_URL = os.getenv("TEST_AI_URL", "http://localhost:8000")
ADMIN_EMAIL = "admin@muraho.rw"
ADMIN_PASSWORD = "MurahoAdmin2026!"


@pytest.fixture
def client():
    """Synchronous HTTP client for API tests."""
    with httpx.Client(base_url=BASE_URL, timeout=30) as c:
        yield c


@pytest.fixture
def admin_client(client):
    """Authenticated admin client with session cookie."""
    resp = client.post("/users/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD,
    })
    assert resp.status_code == 200, f"Admin login failed: {resp.text}"
    token = resp.json().get("token")
    client.headers["Authorization"] = f"JWT {token}"
    return client


@pytest.fixture
def ai_client():
    """Client for AI service endpoints."""
    with httpx.Client(base_url=AI_URL, timeout=30) as c:
        yield c


# ══════════════════════════════════════════════════════════
#  AUTH ENDPOINTS
# ══════════════════════════════════════════════════════════

class TestAuth:
    def test_login_success(self, client):
        resp = client.post("/users/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "token" in data
        assert data["user"]["email"] == ADMIN_EMAIL

    def test_login_wrong_password(self, client):
        resp = client.post("/users/login", json={
            "email": ADMIN_EMAIL,
            "password": "wrongpassword",
        })
        assert resp.status_code in [401, 400]

    def test_me_unauthenticated(self, client):
        resp = client.get("/users/me")
        assert resp.status_code == 401

    def test_me_authenticated(self, admin_client):
        resp = admin_client.get("/users/me")
        assert resp.status_code == 200
        data = resp.json()
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"


# ══════════════════════════════════════════════════════════
#  COLLECTION CRUD
# ══════════════════════════════════════════════════════════

class TestCollections:
    def test_list_museums(self, client):
        resp = client.get("/museums?limit=10")
        assert resp.status_code == 200
        data = resp.json()
        assert "docs" in data
        assert "totalDocs" in data

    def test_list_locations(self, client):
        resp = client.get("/locations?limit=10")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data["docs"], list)

    def test_list_routes(self, client):
        resp = client.get("/routes?limit=10")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data["docs"], list)

    def test_list_stories(self, client):
        resp = client.get("/stories?limit=10")
        assert resp.status_code == 200

    def test_museum_by_slug(self, client):
        resp = client.get("/museums", params={
            "where[slug][equals]": "kigali-genocide-memorial",
            "limit": "1",
        })
        assert resp.status_code == 200
        data = resp.json()
        if data["totalDocs"] > 0:
            museum = data["docs"][0]
            assert museum["slug"] == "kigali-genocide-memorial"
            assert "latitude" in museum
            assert "longitude" in museum

    def test_create_requires_auth(self, client):
        resp = client.post("/museums", json={"name": "Test Museum"})
        assert resp.status_code in [401, 403]

    def test_admin_can_create_and_delete(self, admin_client):
        # Create
        resp = admin_client.post("/locations", json={
            "name": "Test Location",
            "slug": "test-location-integration",
            "locationType": "cultural_site",
            "latitude": -1.95,
            "longitude": 29.87,
            "isActive": False,
        })
        assert resp.status_code in [200, 201]
        loc_id = resp.json()["doc"]["id"] if "doc" in resp.json() else resp.json()["id"]

        # Delete
        resp = admin_client.delete(f"/locations/{loc_id}")
        assert resp.status_code == 200


# ══════════════════════════════════════════════════════════
#  SPATIAL ENDPOINTS
# ══════════════════════════════════════════════════════════

class TestSpatial:
    def test_nearby_points(self, client):
        resp = client.post("/spatial/nearby", json={
            "latitude": -1.9403,
            "longitude": 29.8739,
            "radiusKm": 10,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "points" in data
        # All points should have required fields
        for point in data["points"]:
            assert "id" in point
            assert "latitude" in point
            assert "longitude" in point
            assert "type" in point
            assert "distanceKm" in point

    def test_nearby_with_type_filter(self, client):
        resp = client.post("/spatial/nearby", json={
            "latitude": -1.9403,
            "longitude": 29.8739,
            "radiusKm": 50,
            "types": ["museum"],
        })
        assert resp.status_code == 200
        data = resp.json()
        for point in data["points"]:
            assert point["type"] == "museum"

    def test_bbox_points(self, client):
        resp = client.post("/spatial/bbox", json={
            "north": -1.8,
            "south": -2.0,
            "east": 30.0,
            "west": 29.7,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "points" in data

    def test_layers(self, client):
        resp = client.post("/spatial/layers", json={})
        assert resp.status_code == 200
        data = resp.json()
        assert "layers" in data
        assert "routeLines" in data

    def test_invalid_coordinates_rejected(self, client):
        resp = client.post("/spatial/nearby", json={
            "latitude": 99,
            "longitude": 99,
            "radiusKm": 10,
        })
        # Should either reject or return empty results
        assert resp.status_code in [200, 400]


# ══════════════════════════════════════════════════════════
#  AI SERVICE ENDPOINTS
# ══════════════════════════════════════════════════════════

class TestAIService:
    def test_health(self, ai_client):
        resp = ai_client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] in ["healthy", "degraded", "unhealthy"]

    def test_health_ping(self, ai_client):
        resp = ai_client.get("/health/ping")
        assert resp.status_code == 200

    def test_ask_rwanda_non_streaming(self, ai_client):
        resp = ai_client.post("/api/v1/ask", json={
            "query": "What is the Kigali Genocide Memorial?",
            "mode": "standard",
            "stream": False,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "answer" in data or "content" in data

    def test_ask_rwanda_kid_mode(self, ai_client):
        resp = ai_client.post("/api/v1/ask", json={
            "query": "Tell me about Rwanda's gorillas",
            "mode": "kid_friendly",
            "stream": False,
        })
        assert resp.status_code == 200

    def test_embed_content(self, ai_client):
        resp = ai_client.post("/api/v1/embed", json={
            "chunks": [{
                "chunk_id": "test-chunk-1",
                "text": "The Kigali Genocide Memorial is a place of remembrance.",
                "metadata": {
                    "source_id": "test-source-1",
                    "source_type": "story",
                    "language": "en",
                },
            }],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "embedded_count" in data

    def test_index_content(self, ai_client):
        resp = ai_client.post("/api/v1/index-content", json={
            "contentId": "test-content-id",
            "contentType": "stories",
            "operation": "update",
        })
        # May fail if CMS isn't running, but should not 500
        assert resp.status_code in [200, 502]

    def test_embed_search(self, ai_client):
        resp = ai_client.post("/api/v1/embed/search", params={
            "query": "genocide memorial",
            "limit": 5,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "results" in data


# ══════════════════════════════════════════════════════════
#  WEBHOOK ENDPOINTS
# ══════════════════════════════════════════════════════════

class TestWebhooks:
    def test_stripe_webhook_rejects_invalid_signature(self, client):
        resp = client.post("/webhooks/stripe",
            content=json.dumps({"type": "checkout.session.completed"}),
            headers={
                "Content-Type": "application/json",
                "stripe-signature": "invalid_signature",
            },
        )
        # Should reject due to invalid signature
        assert resp.status_code in [400, 401, 403]

    def test_flutterwave_webhook_rejects_invalid_hash(self, client):
        resp = client.post("/webhooks/flutterwave",
            json={"event": "charge.completed"},
            headers={"verif-hash": "invalid_hash"},
        )
        assert resp.status_code in [400, 401, 403]


# ══════════════════════════════════════════════════════════
#  ASK RWANDA (via Payload proxy)
# ══════════════════════════════════════════════════════════

class TestAskRwandaEndpoint:
    def test_ask_via_payload(self, client):
        resp = client.post("/ask-rwanda", json={
            "query": "What museums can I visit in Kigali?",
            "mode": "standard",
            "preview": True,  # Non-streaming
        })
        # Returns 200 with answer or 503 if AI service is down
        assert resp.status_code in [200, 503]

    def test_ask_empty_query_rejected(self, client):
        resp = client.post("/ask-rwanda", json={
            "query": "",
            "mode": "standard",
        })
        assert resp.status_code in [400, 422]


# ══════════════════════════════════════════════════════════
#  TTS ENDPOINT
# ══════════════════════════════════════════════════════════

class TestTTS:
    def test_tts_via_payload(self, client):
        resp = client.post("/tts", json={
            "text": "Welcome to Kigali.",
            "language": "en",
        })
        # 200 with audio or 503 if TTS service unavailable
        assert resp.status_code in [200, 503]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
