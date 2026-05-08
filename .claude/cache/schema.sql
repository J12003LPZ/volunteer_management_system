-- SQLite Cache Schema for Claude Subagents
-- Used by SQLite MCP server for persistent caching

-- Main cache table
CREATE TABLE IF NOT EXISTS cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent TEXT NOT NULL,
  query_hash TEXT NOT NULL,
  query_text TEXT,
  result TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  expires_at INTEGER,
  hit_count INTEGER DEFAULT 0,
  UNIQUE(agent, query_hash)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_cache_agent ON cache(agent);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_cache_query ON cache(query_hash);
CREATE INDEX IF NOT EXISTS idx_cache_hits ON cache(hit_count DESC);

-- Cache statistics per agent
CREATE TABLE IF NOT EXISTS cache_stats (
  agent TEXT PRIMARY KEY,
  total_hits INTEGER DEFAULT 0,
  total_misses INTEGER DEFAULT 0,
  last_cleanup INTEGER,
  entries_count INTEGER DEFAULT 0
);

-- Token usage tracking
CREATE TABLE IF NOT EXISTS token_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent TEXT NOT NULL,
  operation TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  timestamp INTEGER DEFAULT (unixepoch()),
  session_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_token_agent ON token_usage(agent);
CREATE INDEX IF NOT EXISTS idx_token_timestamp ON token_usage(timestamp);

-- View for cache cleanup (LRU - least recently used with lowest hit count)
CREATE VIEW IF NOT EXISTS cache_lru AS
SELECT id, agent, query_hash, hit_count, created_at
FROM cache
ORDER BY hit_count ASC, created_at ASC;

-- View for expired entries
CREATE VIEW IF NOT EXISTS cache_expired AS
SELECT id, agent, query_hash
FROM cache
WHERE expires_at IS NOT NULL AND expires_at < unixepoch();
