CREATE TABLE IF NOT EXISTS visibility_leads (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 email TEXT NOT NULL,
 business_url TEXT NOT NULL,
 business_name TEXT NOT NULL,
 category TEXT NOT NULL,
 location TEXT NOT NULL,
 score INTEGER NOT NULL CHECK(score BETWEEN 0 AND 100),
 consented_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_visibility_leads_created ON visibility_leads(consented_at);
CREATE TABLE IF NOT EXISTS rate_limits (
 bucket TEXT PRIMARY KEY,
 hits INTEGER NOT NULL DEFAULT 0,
 expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_visibility_rate_limits_expire ON rate_limits(expires_at);
