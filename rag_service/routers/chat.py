"""
Chat API router for the CivicPulse RAG service.
Handles chat requests, session management, and rate limiting.
"""

import logging
import time
from collections import defaultdict
from typing import Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from chains.rag_chain import process_chat
from memory.conversation import memory_manager
from config import config

logger = logging.getLogger(__name__)

router = APIRouter()

# ── Rate Limiting ──────────────────────────────────────────────
_rate_limit_store: dict[str, list[float]] = defaultdict(list)


def _check_rate_limit(session_id: str) -> bool:
    """Check if session is within rate limit. Returns True if allowed."""
    now = time.time()
    window = 60  # 1 minute window
    max_requests = config.RATE_LIMIT_PER_MINUTE

    # Clean old entries
    _rate_limit_store[session_id] = [
        ts for ts in _rate_limit_store[session_id] if now - ts < window
    ]

    if len(_rate_limit_store[session_id]) >= max_requests:
        return False

    _rate_limit_store[session_id].append(now)
    return True


# ── Pydantic Models ───────────────────────────────────────────

class ChatRequest(BaseModel):
    """Request body for the chat endpoint."""

    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="The user's question or message.",
    )
    session_id: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Unique session identifier for conversation memory.",
    )
    user_context: Optional[dict] = Field(
        default=None,
        description="Optional user context: state, area, role, username.",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "message": "How do I report a pothole on CivicPulse?",
                    "session_id": "user-abc-123",
                    "user_context": {
                        "state": "maharashtra",
                        "area": "andheri",
                        "role": "user",
                        "username": "rahul_m",
                    },
                }
            ]
        }
    }


class SourceInfo(BaseModel):
    """Information about a retrieved source document."""

    name: str
    category: str


class ChatResponse(BaseModel):
    """Response body for the chat endpoint."""

    answer: str = Field(..., description="The generated response.")
    sources: list[SourceInfo] = Field(
        default_factory=list,
        description="List of source documents used.",
    )
    confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Retrieval confidence score (0-1).",
    )
    session_id: str = Field(..., description="Echo of the session ID.")


class ResetResponse(BaseModel):
    """Response for session reset."""

    success: bool
    message: str
    session_id: str


# ── Endpoints ─────────────────────────────────────────────────

from fastapi.responses import StreamingResponse

@router.post("/chat")
async def chat(request: ChatRequest):
    """
    Send a message to the CivicPulse AI Assistant.

    The assistant uses RAG to answer questions about:
    - CivicPulse platform features and usage
    - Government schemes and citizen rights
    - Live report statistics from the database
    """
    # Rate limiting
    if not _check_rate_limit(request.session_id):
        raise HTTPException(
            status_code=429,
            detail={
                "message": "Too many requests. Please wait a moment before sending another message.",
                "retry_after_seconds": 60,
            },
        )

    # Input sanitization
    message = request.message.strip()
    if not message:
        raise HTTPException(
            status_code=400,
            detail={"message": "Message cannot be empty."},
        )

    async def sse_generator():
        try:
            async for chunk_str in process_chat(
                question=message,
                session_id=request.session_id,
                user_context=request.user_context,
            ):
                # Format as Server-Sent Event
                yield f"data: {chunk_str}\n\n"
        except Exception as e:
            logger.error(f"Chat stream error: {e}", exc_info=True)
            error_json = '{"type": "error", "message": "Internal server error"}'
            yield f"data: {error_json}\n\n"

    return StreamingResponse(sse_generator(), media_type="text/event-stream")


@router.post("/chat/reset", response_model=ResetResponse)
async def reset_session(session_id: str):
    """Clear conversation memory for a session."""
    cleared = memory_manager.clear_session(session_id)

    return ResetResponse(
        success=cleared,
        message="Conversation history cleared." if cleared else "No active session found.",
        session_id=session_id,
    )
