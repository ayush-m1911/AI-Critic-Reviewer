from pydantic import BaseModel

class AnalyzeRequest(BaseModel):
    text: str
    conversation_id: int

class CreateConversationResponse(BaseModel):
    conversation_id: int