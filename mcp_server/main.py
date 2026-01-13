import json
import os
import inspect
import re
from typing import Any, Dict, Optional
from fastmcp import FastMCP

mcp = FastMCP("SlidesVendorRegistry")

# This is the single function that will handle ALL slide types
def universal_slide_handler(slide_data: Dict[str, Any]):
    # This logic would be where you call the actual vendor code/API
    print(f"Executing slide creation with data: {slide_data}")
    return {"status": "success", "data_received": slide_data}

def is_valid_python_identifier(name: str) -> bool:
    """Validate that a string is a valid Python identifier"""
    if not name or not isinstance(name, str):
        return False
    # Must match Python identifier rules: start with letter/underscore,
    # followed by letters, digits, or underscores
    return re.match(r'^[a-zA-Z_][a-zA-Z0-9_]*$', name) is not None

def validate_config(config: Dict[str, Any]) -> Optional[str]:
    """
    Validate configuration to prevent code injection.
    Returns None if valid, error message string if invalid.
    """
    # Validate name field
    name = config.get("name")
    if not name or not isinstance(name, str):
        return "Missing or invalid 'name' field"

    if not is_valid_python_identifier(name):
        return f"Invalid function name '{name}': must be a valid Python identifier"

    # Validate description exists and is a string
    description = config.get("description")
    if not isinstance(description, str):
        return "Missing or invalid 'description' field"

    # Validate parameters structure
    parameters = config.get("parameters", {})
    if not isinstance(parameters, dict):
        return "Invalid 'parameters' field: must be an object"

    properties = parameters.get("properties", {})
    if not isinstance(properties, dict):
        return "Invalid 'parameters.properties' field: must be an object"

    # Validate all parameter names are valid identifiers
    for param_name in properties.keys():
        if not is_valid_python_identifier(param_name):
            return f"Invalid parameter name '{param_name}': must be a valid Python identifier"

    # Validate required field if present
    required = parameters.get("required", [])
    if not isinstance(required, list):
        return "Invalid 'parameters.required' field: must be an array"

    for req_param in required:
        if not isinstance(req_param, str) or not is_valid_python_identifier(req_param):
            return f"Invalid required parameter name '{req_param}'"

    return None

def create_dynamic_function(config: Dict[str, Any]) -> Optional[callable]:
    """
    Create a function with proper signature based on JSON schema parameters.
    Returns the function if successful, None if validation fails.
    """
    # Validate configuration first
    validation_error = validate_config(config)
    if validation_error:
        print(f"Configuration validation failed: {validation_error}")
        return None

    params = config.get("parameters", {}).get("properties", {})
    required = config.get("parameters", {}).get("required", [])
    name = config["name"]
    description = config["description"]

    # Build parameter list dynamically (all names are now validated)
    param_list = []
    for param_name in params.keys():
        if param_name in required:
            param_list.append(param_name)
        else:
            param_list.append(f"{param_name}=None")

    # Create function code as string
    func_params = ", ".join(param_list)

    # Build the slide_data dict safely using validated parameter names
    param_dict_items = ", ".join([f'"{p}": {p}' for p in params.keys()])

    func_code = f"""
def {name}({func_params}):
    slide_data = {{{param_dict_items}}}
    return universal_slide_handler(slide_data)
"""

    # Execute the code to create the function
    local_namespace = {"universal_slide_handler": universal_slide_handler}
    exec(func_code, local_namespace)

    # Set function metadata safely using attributes instead of embedding in code
    func = local_namespace[name]
    func.__doc__ = description

    return func

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

                # Only register if validation passed
                if tool_handler is None:
                    app_name = os.path.basename(root)
                    print(f"Skipped invalid plugin from app: {app_name}")
                    continue

                # Register the tool with the server using @mcp.tool decorator approach
                mcp.tool(tool_handler)
                app_name = os.path.basename(root)
                print(f"Registered slide type '{config['name']}' from app: {app_name}")
            except Exception as e:
                app_name = os.path.basename(root)
                print(f"Error loading {spec_file} from app '{app_name}': {e}")

load_vendor_plugins()
if __name__ == "__main__":
    mcp.run()