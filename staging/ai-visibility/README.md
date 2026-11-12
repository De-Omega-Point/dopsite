# AI Visibility staging

This isolated implementation prepares the AI Visibility scanner for the company domain, without replacing the GitHub Pages main site or deploying a production change.

## Architecture

- Static browser UI: `ai-visibility/index.html`, ultimately served at `https://de-omega-point.com/ai-visibility/`.
- Staging API: Cloudflare Worker `dop-ai-visibility-staging`. It must use a dedicated D1 database for leads and per-IP rate-limit buckets.
- Browser requests use CORS to permit the branded production origin only. A deployment preview served from another origin **cannot perform scans** until a trusted staging origin is explicitly added to the Worker allowlist.
- The static browser page includes the proposed staging Worker URL. **Do not release to production while the URL is unverified.**

## Required gates before publishing

1. Configure and deploy the Worker with the D1 binding from `wrangler.toml`; apply `schema.sql` with Wrangler D1 execute on the staging database.
2. Verify the actual workers.dev subdomain, then update the UI API_BASE accordingly.
3. Test with a staging origin or browser test on the intended domain following release approval: scans succeed, competitors are scored, failures are clear, request rate limits work, lead email + consent are persisted.
4. Verify input handling against localhost, cloud metadata addresses, custom ports, loopback and redirects. Additional outbound resolution controls should be independently security-reviewed before wider public release; Workers fetch restrictions alone are not a full SSRF defence.
5. Confirm consent wording and Australian Privacy Act obligations, data retention, and a secure admin-only process for accessing lead records.
6. Confirm the full site homepage, AI Safety page, Lightbridge, mobile navigation and original site paths remain functional.
7. Obtain **explicit separate founder approval** before merging into `main`.

## Limitations

Scores are heuristic website readiness signals, **not measured AI search ranking**. Lead intake requires a working D1 binding, and will refuse requests otherwise. This staging code is not yet a production-certified security release.
