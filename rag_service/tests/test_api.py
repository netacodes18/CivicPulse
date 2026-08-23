"""
Tests for the FastAPI chat endpoints.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_endpoint():
    """Health endpoint should return 200 with status info."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "components" in data
    assert data["service"] == "CivicPulse RAG Service"


def test_chat_missing_message():
    """Chat should reject requests without a message."""
    response = client.post("/chat", json={
        "session_id": "test-session",
    })
    assert response.status_code == 422  # Pydantic validation error


def test_chat_missing_session_id():
    """Chat should reject requests without a session_id."""
    response = client.post("/chat", json={
        "message": "Hello",
    })
    assert response.status_code == 422


def test_chat_empty_message():
    """Chat should reject empty messages."""
    response = client.post("/chat", json={
        "message": "",
        "session_id": "test-session",
    })
    assert response.status_code == 422


def test_chat_message_too_long():
    """Chat should reject messages over 2000 chars."""
    response = client.post("/chat", json={
        "message": "x" * 2001,
        "session_id": "test-session",
    })
    assert response.status_code == 422


def test_reset_session():
    """Reset should return success even for nonexistent sessions."""
    response = client.post(
        "/chat/reset",
        params={"session_id": "nonexistent-session"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "success" in data
