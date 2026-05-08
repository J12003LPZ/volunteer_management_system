# OpenAPI Patterns (KB)

- Error envelope design and problem+json.
- Pagination: page/limit vs. cursor.
- Versioning: header vs. path.

Example schema

```yaml
components:
  schemas:
    Error:
      type: object
      properties:
        type: { type: string }
        title: { type: string }
        detail: { type: string }
```

