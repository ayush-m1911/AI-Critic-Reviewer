from fastapi import FastAPI
from graph.builder import build_graph
from models import AnalyzeRequest
from services.conversation_service import (
    create_conversation,
    save_message,
    get_messages,
    get_conversations
)

app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
graph = build_graph()

@app.post("/conversation")
def new_conversation():
    conv_id = create_conversation()
    return {"conversation_id": conv_id}

@app.get("/conversations")
def list_conversations():
    rows = get_conversations()
    return [
        {"id": r[0], "title": r[1], "created_at": r[2]}
        for r in rows
    ]

@app.get("/conversation/{conv_id}")
def conversation_history(conv_id: int):
    rows = get_messages(conv_id)
    return [{"role": r[0], "content": r[1]} for r in rows]

@app.post("/analyze")
def analyze(req: AnalyzeRequest):

    # Save user input
    save_message(req.conversation_id, "user", req.text)

    # OPTIONAL: get context (last few messages)
    history = get_messages(req.conversation_id)[-3:]

    formatted_context = ""
    for role, content in history:
        if role == "user":
            formatted_context += f"\nUser: {content}"
        else:
            formatted_context += f"\nAI: {content}"

    # Run graph
    MAX_LENGTH = 4000  # characters

    input_text = req.text[:MAX_LENGTH]
    result = graph.invoke({
    "input_text": input_text,
    "context": formatted_context
})

    output = result.get("final_output")

    # Save AI output
    save_message(req.conversation_id, "assistant", output)

    return {"analysis": output}