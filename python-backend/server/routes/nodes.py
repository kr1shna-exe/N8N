from fastapi import APIRouter
import os
import importlib.util

router = APIRouter()

@router.get("/nodes/types")
async def get_node_types():
    """
    Return available node types by dynamically inspecting the nodes directory.
    """
    available_nodes = []
    nodes_dir = os.path.join(os.path.dirname(__file__), "..", "..", "workers", "nodes")

    for filename in os.listdir(nodes_dir):
        if filename.endswith(".py") and not filename.startswith("__"):
            module_name = filename[:-3]
            module_path = os.path.join(nodes_dir, filename)
            
            spec = importlib.util.spec_from_file_location(module_name, module_path)
            if spec and spec.loader:
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)
                
                if hasattr(module, "node_details"):
                    available_nodes.append(module.node_details)

    return {
        "nodes": available_nodes,
        "total": len(available_nodes)
    }
