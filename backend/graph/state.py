from typing import TypedDict, Optional

class State(TypedDict):
    input_text: str
    context: Optional[str]

    intent: Optional[str]
    input_type: Optional[str]

    structure_feedback: Optional[str]
    logic_feedback: Optional[str]
    depth_feedback: Optional[str]

    final_output: Optional[str]