"""
Per-session conversation memory manager.
Maintains separate conversation histories for each chat session.
"""

import logging
from threading import Lock
from collections import OrderedDict

from langchain_core.messages import HumanMessage, AIMessage

logger = logging.getLogger(__name__)

# Maximum number of concurrent sessions to keep in memory
MAX_SESSIONS = 200

# Maximum messages per session (k * 2 for human + AI pairs)
MAX_MESSAGES_PER_SESSION = 20


class ConversationMemoryManager:
    """
    Thread-safe conversation memory manager using an LRU eviction policy.
    Stores chat history per session_id.
    """

    def __init__(self, max_sessions: int = MAX_SESSIONS, max_messages: int = MAX_MESSAGES_PER_SESSION):
        self._sessions: OrderedDict[str, list] = OrderedDict()
        self._max_sessions = max_sessions
        self._max_messages = max_messages
        self._lock = Lock()

    def get_history(self, session_id: str) -> list:
        """
        Get conversation history for a session.

        Args:
            session_id: Unique session identifier.

        Returns:
            List of LangChain message objects (HumanMessage, AIMessage).
        """
        with self._lock:
            if session_id in self._sessions:
                # Move to end (most recently used)
                self._sessions.move_to_end(session_id)
                return list(self._sessions[session_id])
            return []

    def add_exchange(self, session_id: str, human_message: str, ai_message: str) -> None:
        """
        Add a human-AI exchange to the session history.

        Args:
            session_id: Unique session identifier.
            human_message: The user's message.
            ai_message: The assistant's response.
        """
        with self._lock:
            if session_id not in self._sessions:
                self._sessions[session_id] = []

            history = self._sessions[session_id]
            history.append(HumanMessage(content=human_message))
            history.append(AIMessage(content=ai_message))

            # Trim to max messages (keep the most recent)
            if len(history) > self._max_messages:
                self._sessions[session_id] = history[-self._max_messages:]

            # Move to end (most recently used)
            self._sessions.move_to_end(session_id)

            # Evict oldest sessions if over capacity
            while len(self._sessions) > self._max_sessions:
                evicted_id, _ = self._sessions.popitem(last=False)
                logger.debug(f"Evicted session: {evicted_id}")

    def clear_session(self, session_id: str) -> bool:
        """
        Clear conversation history for a session.

        Returns:
            True if session existed and was cleared, False otherwise.
        """
        with self._lock:
            if session_id in self._sessions:
                del self._sessions[session_id]
                return True
            return False

    def get_active_sessions_count(self) -> int:
        """Get the number of active sessions."""
        with self._lock:
            return len(self._sessions)


# Global singleton instance
memory_manager = ConversationMemoryManager()
