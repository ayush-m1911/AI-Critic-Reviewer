from langgraph.graph import StateGraph, END
from .state import State
from .nodes import (
    router_node,
    structure_node,
    logic_node,
    depth_node,
    aggregator_node,
    meta_critic_node
)

def build_graph():
    graph = StateGraph(State)

    graph.add_node("router", router_node)
    graph.add_node("structure", structure_node)
    graph.add_node("logic", logic_node)
    graph.add_node("depth", depth_node)
    graph.add_node("meta", meta_critic_node)

    graph.set_entry_point("router")

    # Parallel critics
    graph.add_edge("router", "structure")
    graph.add_edge("router", "logic")
    graph.add_edge("router", "depth")

    # Merge into meta critic
    graph.add_edge("structure", "meta")
    graph.add_edge("logic", "meta")
    graph.add_edge("depth", "meta")

    graph.add_edge("meta", END)

    return graph.compile()