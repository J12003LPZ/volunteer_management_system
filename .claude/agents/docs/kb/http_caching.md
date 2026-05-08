# HTTP Caching (KB)

- ETag vs. Last-Modified; strong vs. weak validators.
- Cache-Control: public/private, max-age, stale-while-revalidate.
- Surrogate keys for CDNs.

Snippet

```http
Cache-Control: public, max-age=60, stale-while-revalidate=300
ETag: "abc123"
```

