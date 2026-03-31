from langchain_groq import ChatGroq
import os 
from dotenv import load_dotenv
load_dotenv()
from langchain_core.messages import SystemMessage, HumanMessage
from .state import State
from .prompts import ROUTER_PROMPT
from .prompts import STRUCTURE_PROMPT, LOGIC_PROMPT, DEPTH_PROMPT, META_CRITIC_PROMPT


llm = ChatGroq(
    model="llama-3.1-8b-instant",
    groq_api_key=os.getenv("GROQ_API_KEY")
)


import json

def router_node(state: State) -> dict:
    prompt = f"""
{ROUTER_PROMPT}

Previous Conversation:
{state.get("context", "")}

Current Input:
{state["input_text"]}
"""

    response = llm.invoke(prompt)

    import json

    try:
        data = json.loads(response.content)
        intent = data.get("intent", "critique")
        input_type = data.get("type", "blog")
    except:
        intent = "critique"
        input_type = "blog"

    return {
        "intent": intent,
        "input_type": input_type
    }
def structure_node(state: State) -> dict:
    input_data = f"""
Previous Conversation:
{state.get("context", "")}

Current Input:
{state["input_text"]}
"""

    response = llm.invoke(
        STRUCTURE_PROMPT + "\n\n" + input_data
    )

    return {"structure_feedback": response.content}

def logic_node(state: State) -> dict:
    input_data = f"""
Previous Conversation:
{state.get("context", "")}

Current Input:
{state["input_text"]}
"""

    response = llm.invoke(
        LOGIC_PROMPT + "\n\n" + input_data
    )

    return {"logic_feedback": response.content}

def depth_node(state: State) -> dict:
    input_data = f"""
Previous Conversation:
{state.get("context", "")}

Current Input:
{state["input_text"]}
"""

    response = llm.invoke(
        DEPTH_PROMPT + "\n\n" + input_data
    )

    return {"depth_feedback": response.content}

def aggregator_node(state: State) -> dict:
    combined = f"""
=== STRUCTURE REVIEW ===
{state.get("structure_feedback", "")}

=== LOGIC REVIEW ===
{state.get("logic_feedback", "")}

=== DEPTH REVIEW ===
{state.get("depth_feedback", "")}
"""

    return {"final_output": combined}

def meta_critic_node(state: State) -> dict:
    combined_feedback = f"""
STRUCTURE REVIEW:
{state.get("structure_feedback", "")}

LOGIC REVIEW:
{state.get("logic_feedback", "")}

DEPTH REVIEW:
{state.get("depth_feedback", "")}
"""

    prompt = f"""
Intent: {state.get("intent")}

{META_CRITIC_PROMPT}

If the user input depends on previous conversation,
use that context while generating the response.

Reviews:
{combined_feedback}
"""

    response = llm.invoke(prompt)

    return {"final_output": response.content}