# {{ metadata.title }}

{{ overview.description }}

## Overview

**API Name:** {{ overview.api_name }}  
**API Type:** {{ metadata.api_type }}  
**Base URL:** {{ metadata.base_url }}  
**Authentication:** {{ overview.authentication }}  

{{ overview.api_description }}

## MCP Server Information

- **Server ID:** {{ mcp_info.server_id }}
- **Docker Image:** {{ mcp_info.docker_image or "Not available" }}
- **Generated:** {{ metadata.generated_at }}

{% if endpoints %}
## API Endpoints

{% for endpoint in endpoints %}
### {{ endpoint.method }} {{ endpoint.path }}

{{ endpoint.description }}

**Summary:** {{ endpoint.summary }}

{% if endpoint.parameters %}
**Parameters:**
{% for param in endpoint.parameters %}
- `{{ param.name }}` ({{ param.in }}) - {{ param.description or "No description" }}
{% endfor %}
{% endif %}

{% if endpoint.request_body %}
**Request Body:**
```json
{{ endpoint.request_body | tojson(indent=2) }}
```
{% endif %}

{% if endpoint.responses %}
**Responses:**
{% for status, response in endpoint.responses.items() %}
- **{{ status }}**: {{ response.description or "No description" }}
{% endfor %}
{% endif %}

{% if endpoint.examples %}
**Examples:**
{% for example in endpoint.examples %}
```{{ example.language }}
{{ example.code }}
```
{% endfor %}
{% endif %}

---
{% endfor %}
{% endif %}

{% if schemas %}
## Data Schemas

{% for schema_name, schema in schemas.items() %}
### {{ schema_name }}

```json
{{ schema | tojson(indent=2) }}
```
{% endfor %}
{% endif %}

{% if examples %}
## Usage Examples

{% for example in examples %}
### {{ example.title }}

```{{ example.language }}
{{ example.code }}
```
{% endfor %}
{% endif %}

## Configuration

{% if mcp_info.config %}
```json
{{ mcp_info.config | tojson(indent=2) }}
```
{% else %}
No additional configuration required.
{% endif %}

---

*Documentation generated automatically by MCP Hub Platform*
