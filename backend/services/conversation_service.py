from db import cursor, conn

def create_conversation():
    cursor.execute(
        "INSERT INTO conversations (title) VALUES (?)",
        ("New Chat",)
    )
    conn.commit()
    return cursor.lastrowid


def save_message(conversation_id: int, role: str, content: str):
    cursor.execute(
        "INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)",
        (conversation_id, role, content)
    )
    conn.commit()


def get_messages(conversation_id: int):
    cursor.execute(
        "SELECT role, content FROM messages WHERE conversation_id=? ORDER BY id",
        (conversation_id,)
    )
    return cursor.fetchall()


def get_conversations():
    cursor.execute(
        "SELECT id, title, created_at FROM conversations ORDER BY created_at DESC"
    )
    return cursor.fetchall()