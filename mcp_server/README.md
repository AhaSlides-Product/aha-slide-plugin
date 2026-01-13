# Slides Vendor Registry MCP Server

A Model Context Protocol (MCP) server that dynamically registers slide creation tools from vendor plugins. This server scans the `/apps` directory for slide plugin specifications and automatically exposes them as MCP tools.

## Overview

This MCP server provides a flexible plugin system for creating different types of slides. Each app in the `/apps` directory can define its own slide creation specifications via a `slides_agent_specs.json` file, which the server automatically discovers and registers.

## Architecture

The server uses FastMCP to expose slide creation tools. It works by:

1. Scanning all subdirectories in the `/apps` folder
2. Loading `slides_agent_specs.json` files from each app
3. Dynamically creating Python functions with proper type signatures based on the JSON schema
4. Registering these functions as MCP tools

## Setup

### Prerequisites

- Python 3.12+
- Virtual environment (venv)

### Installation

1. Create and activate a virtual environment:

```bash
cd mcp_server
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

## Running the Server

### HTTP Transport

To start the server with HTTP transport on port 8000:

```bash
source venv/bin/activate
fastmcp run main.py:mcp --transport http --port 8000
```

The server will be available at: `http://127.0.0.1:8000/mcp`

### Stdio Transport

For stdio transport (useful for local MCP clients):

```bash
source venv/bin/activate
fastmcp run main.py:mcp --transport stdio
```

## Creating a Slide Plugin

To add a new slide type, create a `slides_agent_specs.json` file in your app directory under `/apps`.

### File Location

```
/apps/
  └── your-app-name/
      └── slides_agent_specs.json
```

### JSON Schema Format

```json
{
  "name": "create_your_slide_type",
  "description": "Description of what this slide type does.",
  "parameters": {
    "type": "object",
    "properties": {
      "param1": {
        "type": "string",
        "description": "Description of parameter 1"
      },
      "param2": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Description of parameter 2"
      }
    },
    "required": ["param1"]
  }
}
```

### Schema Fields

- **name**: The tool name (must be a valid Python function name)
- **description**: Human-readable description of what the slide does. This one is also provided to LLM agent to understand the slide type
- **parameters**: JSON Schema object defining the tool's parameters
  - **properties**: Object containing parameter definitions
  - **required**: Array of required parameter names

### Example: Bullet Slide

```json
{
  "name": "create_bullet_slide",
  "description": "Creates a slide with a title and a list of bullet points.",
  "parameters": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "The slide title"
      },
      "bullets": {
        "type": "array",
        "items": { "type": "string" },
        "description": "List of bullet points"
      }
    },
    "required": ["title", "bullets"]
  }
}
```

## Project Structure

```
mcp_server/
├── main.py                 # Main server implementation
├── requirements.txt        # Python dependencies
├── venv/                   # Virtual environment (created during setup)
└── README.md              # This file

../apps/                    # Scanned for plugin specs
├── sample-slide/
│   └── slides_agent_specs.json
```

## How It Works

### Dynamic Function Generation

The server dynamically generates Python functions based on the JSON schema:

1. Reads the JSON schema from `slides_agent_specs.json`
2. Extracts parameter definitions (names, types, required status)
3. Generates a Python function with proper signature
4. Registers the function as an MCP tool

### Universal Handler

All slide creation requests are routed through `universal_slide_handler()`, which:
- Receives the slide data as a dictionary
- Processes the request
- Returns a success response with the received data

## Dependencies

- **fastmcp** (v2.14.3): FastMCP framework for creating MCP servers

## Troubleshooting

### Plugin Not Loading

1. Verify the file is named exactly `slides_agent_specs.json`
2. Check JSON syntax is valid
3. Ensure the file is in a subdirectory of `/apps`
4. Check server logs for error messages
