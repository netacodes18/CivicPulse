"""
Tests for the conversation memory manager.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from memory.conversation import ConversationMemoryManager
from langchain_core.messages import HumanMessage, AIMessage


def test_empty_history():
    """New sessions should have empty history."""
    mgr = ConversationMemoryManager()
    assert mgr.get_history("nonexistent") == []


def test_add_and_retrieve():
    """Added exchanges should be retrievable."""
    mgr = ConversationMemoryManager()
    mgr.add_exchange("s1", "Hello", "Hi there!")
    history = mgr.get_history("s1")
    assert len(history) == 2
    assert isinstance(history[0], HumanMessage)
    assert isinstance(history[1], AIMessage)
    assert history[0].content == "Hello"
    assert history[1].content == "Hi there!"


def test_multiple_exchanges():
    """Multiple exchanges should accumulate."""
    mgr = ConversationMemoryManager()
    mgr.add_exchange("s1", "Q1", "A1")
    mgr.add_exchange("s1", "Q2", "A2")
    history = mgr.get_history("s1")
    assert len(history) == 4


def test_session_isolation():
    """Different sessions should have independent histories."""
    mgr = ConversationMemoryManager()
    mgr.add_exchange("s1", "Q1", "A1")
    mgr.add_exchange("s2", "Q2", "A2")
    assert len(mgr.get_history("s1")) == 2
    assert len(mgr.get_history("s2")) == 2
    assert mgr.get_history("s1")[0].content == "Q1"
    assert mgr.get_history("s2")[0].content == "Q2"


def test_clear_session():
    """Cleared sessions should be empty."""
    mgr = ConversationMemoryManager()
    mgr.add_exchange("s1", "Q1", "A1")
    assert mgr.clear_session("s1") is True
    assert mgr.get_history("s1") == []


def test_clear_nonexistent():
    """Clearing a nonexistent session should return False."""
    mgr = ConversationMemoryManager()
    assert mgr.clear_session("nope") is False


def test_max_messages_trimming():
    """History should be trimmed to max_messages."""
    mgr = ConversationMemoryManager(max_messages=4)
    mgr.add_exchange("s1", "Q1", "A1")
    mgr.add_exchange("s1", "Q2", "A2")
    mgr.add_exchange("s1", "Q3", "A3")  # This should cause trimming
    history = mgr.get_history("s1")
    assert len(history) == 4  # Last 4 messages (Q2,A2,Q3,A3)
    assert history[0].content == "Q2"


def test_lru_eviction():
    """Oldest sessions should be evicted when max is reached."""
    mgr = ConversationMemoryManager(max_sessions=2)
    mgr.add_exchange("s1", "Q1", "A1")
    mgr.add_exchange("s2", "Q2", "A2")
    mgr.add_exchange("s3", "Q3", "A3")  # Should evict s1
    assert mgr.get_history("s1") == []  # Evicted
    assert len(mgr.get_history("s2")) == 2
    assert len(mgr.get_history("s3")) == 2


def test_active_sessions_count():
    """Count should track active sessions."""
    mgr = ConversationMemoryManager()
    assert mgr.get_active_sessions_count() == 0
    mgr.add_exchange("s1", "Q", "A")
    assert mgr.get_active_sessions_count() == 1
    mgr.add_exchange("s2", "Q", "A")
    assert mgr.get_active_sessions_count() == 2
    mgr.clear_session("s1")
    assert mgr.get_active_sessions_count() == 1
