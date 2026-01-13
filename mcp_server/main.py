import json
import os
import inspect
from typing import Any, Dict
from fastmcp import FastMCP

mcp = FastMCP("SlidesVendorRegistry")

# This is the single function that will handle ALL slide types
def universal_slide_handler(slide_data: Dict[str, Any]):
    # This logic would be where you call the actual vendor code/API
    print(f"Executing slide creation with data: {slide_data}")
    return {"status": "success", "data_received": slide_data}

def create_dynamic_function(config: Dict[str, Any]):
    """Create a function with proper signature based on JSON schema parameters"""
    params = config.get("parameters", {}).get("properties", {})
    required = config.get("parameters", {}).get("required", [])

    # Build parameter list dynamically
    param_list = []
    for param_name, param_spec in params.items():
        if param_name in required:
            param_list.append(f"{param_name}")
        else:
            param_list.append(f"{param_name}=None")

    # Create function code as string
    func_params = ", ".join(param_list)
    func_code = f"""
def {config['name']}({func_params}):
    ''''{config['description']}'''
    slide_data = {{{', '.join([f'"{p}": {p}' for p in params.keys()])}}}
    return universal_slide_handler(slide_data)
"""

    # Execute the code to create the function
    local_namespace = {"universal_slide_handler": universal_slide_handler}
    exec(func_code, local_namespace)
    return local_namespace[config['name']]

def load_vendor_plugins(apps_dir="../apps"):
    """Scan apps folder for slides_agent_specs.json files"""
    apps_path = os.path.abspath(os.path.join(os.path.dirname(__file__), apps_dir))

    if not os.path.exists(apps_path):
        print(f"Warning: Apps directory not found at {apps_path}")
        return

    # Walk through all subdirectories in apps folder
    for root, dirs, files in os.walk(apps_path):
        if "slides_agent_specs.json" in files:
            spec_file = os.path.join(root, "slides_agent_specs.json")
            try:
                with open(spec_file) as f:
                    config = json.load(f)

                # Create a dynamic function with proper signature
                tool_handler = create_dynamic_function(config)

                # Register the tool with the server using @mcp.tool decorator approach
                mcp.tool(tool_handler)
                app_name = os.path.basename(root)
                print(f"Registered slide type '{config['name']}' from app: {app_name}")
            except Exception as e:
                print(f"Error loading {spec_file}: {e}")

load_vendor_plugins()
if __name__ == "__main__":
    mcp.run()