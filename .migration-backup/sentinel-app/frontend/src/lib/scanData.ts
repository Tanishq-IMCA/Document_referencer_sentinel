import { LastScan, SeverityLevel } from '@/types';

// Rich, realistic mock scan data for neural-search (Python/ML repo)
export const mockNeuralSearchScan: LastScan = {
  overallScore: 74,
  scanDate: '2025-07-01',
  securityScore: 81,
  codeQualityScore: 68,
  architectureScore: 79,
  skillScore: 72,
  metrics: {
    totalFiles: 187,
    linesOfCode: 14382,
    testCoverage: 34,
    avgComplexity: 8.4,
    duplication: 12,
  },
  findings: [
    {
      id: 'f1', severity: 'critical' as SeverityLevel,
      title: 'SQL Injection via F-String Concatenation',
      description: 'User-controlled input is interpolated directly into a raw SQL query via f-string in the document search endpoint. This allows arbitrary SQL execution including UNION-based data exfiltration. The query builder at src/db/search.py:142 accepts a `user_id` parameter that flows unsanitized into `cursor.execute(f"SELECT * FROM docs WHERE id={user_id}")`.',
      file: 'src/db/search.py', line: 142, tool: 'Semgrep',
      recommendation: 'Migrate to parameterized queries using SQLAlchemy ORM or psycopg2 placeholders: `cursor.execute("SELECT * FROM docs WHERE id=%s", (user_id,))`. Add an integration test with sqlmap to verify fix.'
    },
    {
      id: 'f2', severity: 'high' as SeverityLevel,
      title: 'Hardcoded OpenAI API Key in Settings Module',
      description: 'A production API key (sk-proj-*) was committed to version control in config/settings.py. Git history shows it was added in commit a3f21b. The key has been rotated, but the commit remains in history.',
      file: 'config/settings.py', line: 23, tool: 'Bandit',
      recommendation: 'Remove the key from history using `git filter-repo` or BFG. Move all secrets to `.env` loaded via python-dotenv. Rotate the key and audit API usage logs for unauthorized access.'
    },
    {
      id: 'f3', severity: 'high' as SeverityLevel,
      title: 'Missing Rate Limiting on /search Public Endpoint',
      description: 'The semantic search endpoint at src/api/routes.py:89 has no rate limiting, circuit breaker, or IP-based throttling. A single client can submit unlimited embedding queries, causing GPU OOM and cascading failure of the inference worker.',
      file: 'src/api/routes.py', line: 89, tool: 'Semgrep',
      recommendation: 'Implement token-bucket rate limiting with redis-py. Add `limiter = Limiter(key_func=get_remote_address)` via slowapi. Set burst=20/min, sustained=100/hr per IP. Add 429 response with Retry-After header.'
    },
    {
      id: 'f4', severity: 'medium' as SeverityLevel,
      title: 'Pickle Deserialization of User-Supplied Embeddings',
      description: 'The indexing pipeline at src/core/indexer.py:201 uses `pickle.loads()` on blob data from S3 without schema validation. An attacker who compromises the S3 bucket can achieve RCE by uploading a malicious pickle payload.',
      file: 'src/core/indexer.py', line: 201, tool: 'Bandit',
      recommendation: 'Replace pickle with msgpack or protobuf for serialization. Add HMAC-SHA256 signature verification on all blobs before deserialization. Rotate S3 IAM credentials and enable bucket versioning + MFA delete.'
    },
    {
      id: 'f5', severity: 'medium' as SeverityLevel,
      title: 'CORS Misconfiguration Allows Credential Theft',
      description: 'CORS is configured with `allow_origins=["*"]` and `allow_credentials=True` in src/api/middleware.py:44. This enables cross-origin credential theft from any domain.',
      file: 'src/api/middleware.py', line: 44, tool: 'Semgrep',
      recommendation: 'Whitelist explicit origins: `allow_origins=["https://app.reposight.dev"]`. Remove wildcard when credentials are enabled. Add a preflight cache TTL of 600s.'
    },
    {
      id: 'f6', severity: 'low' as SeverityLevel,
      title: 'MD5 Used for Cache Key Hashing',
      description: 'MD5 is used in src/utils/cache.py:67 for non-cryptographic cache key generation. While not a direct security risk, it may trigger compliance audits (SOC 2, ISO 27001) and confuse security reviewers.',
      file: 'src/utils/cache.py', line: 67, tool: 'Bandit',
      recommendation: 'Replace with SHA-256 for cache keys or xxhash for performance-critical paths. Document the non-cryptographic use case in a SECURITY.md note.'
    },
    {
      id: 'f7', severity: 'low' as SeverityLevel,
      title: 'Debug Mode Enabled in Production WSGI Config',
      description: 'The production gunicorn configuration at deploy/gunicorn.conf.py:12 sets `reload=True` and `debug=True`. This exposes stack traces and interactive debugger on uncaught exceptions.',
      file: 'deploy/gunicorn.conf.py', line: 12, tool: 'Semgrep',
      recommendation: 'Set `reload=False`, `debug=False`, and `accesslog="-"`. Add a CI check that fails builds containing `debug=True` in deploy/ directory files.'
    },
  ],
  codeSmells: [
    {
      id: 'cs1', type: 'God Function (cyclomatic=28)', file: 'src/core/embeddings.py:201', count: 1,
      severity: 'high' as SeverityLevel,
      description: '`process_embeddings()` spans 247 lines with 28 branches. It handles tokenization, batching, device selection, error recovery, and logging all in one block. Cognitive complexity is off the charts.',
      recommendation: 'Decompose into 5–6 single-responsibility helpers: `tokenize_batch()`, `select_device()`, `run_inference()`, `handle_errors()`, `log_metrics()`. Target <15 lines per function.',
      codeSnippet: 'def process_embeddings(docs, model, cfg):\n    # ... 247 lines ...\n    for batch in chunks(docs, cfg.batch):\n        tokens = tokenizer(batch)\n        if cfg.device == "cuda":\n            # 40 lines of GPU memory handling\n        # 180 more lines'
    },
    {
      id: 'cs2', type: 'Duplicated Normalization Logic', file: 'src/utils/ (4 files)', count: 4,
      severity: 'medium' as SeverityLevel,
      description: 'Identical 23-line normalization pipeline—lowercase, strip punctuation, remove stopwords, lemmatize—appears in preprocessing.py, indexer.py, query_parser.py, and test fixtures.',
      recommendation: 'Extract to a shared `TextNormalizer` class in `src/shared/text.py`. Add unit tests with 100% branch coverage. Use `@lru_cache` for repeated normalizations.',
      codeSnippet: '# In 4 different files:\ntext = text.lower()\ntext = re.sub(r"[^\\w\\s]", "", text)\ntokens = [t for t in text.split() if t not in STOPWORDS]\n# ... 18 more identical lines'
    },
    {
      id: 'cs3', type: 'Missing Type Annotations (67% untyped)', file: 'src/ (124 functions)', count: 124,
      severity: 'low' as SeverityLevel,
      description: '124 of 185 public functions lack type annotations. This cripples IDE autocomplete, prevents mypy from catching contract violations, and makes the codebase harder for new contributors.',
      recommendation: 'Enable `disallow_untyped_defs = True` in mypy config. Start with the public API surface (src/api/, src/core/). Use `typing.Protocol` for duck-typed interfaces.',
    },
    {
      id: 'cs4', type: 'Bare Except Clause', file: 'src/core/indexer.py:334', count: 3,
      severity: 'high' as SeverityLevel,
      description: 'Three bare `except:` clauses swallow KeyboardInterrupt, SystemExit, and GeneratorExit. This makes graceful shutdown impossible and masks critical failures in production.',
      recommendation: 'Replace all bare `except:` with `except Exception as e:`. Add explicit handlers for `KeyboardInterrupt` and `OperationalError`. Log every exception with structlog.',
      codeSnippet: 'try:\n    index_docs(batch)\nexcept:\n    pass  # silently swallows EVERYTHING'
    },
    {
      id: 'cs5', type: 'Mutable Default Arguments', file: 'src/api/ (7 instances)', count: 7,
      severity: 'medium' as SeverityLevel,
      description: '7 functions use mutable defaults like `def handler(docs=[])` or `def query(params={})`. This causes state leakage between requests in long-running server processes.',
      recommendation: 'Use `None` as default and initialize inside the function body. Add a lint rule: `flake8-mutable-defaults` or `ruff` rule B006 to catch this at CI time.',
      codeSnippet: 'def search_docs(query, filters=[]):\n    filters.append(query)\n    # Leaks state across requests!'
    },
    {
      id: 'cs6', type: 'Deep Nesting (indent level > 5)', file: 'src/db/query_builder.py', count: 2,
      severity: 'medium' as SeverityLevel,
      description: 'Two functions have nesting depth of 6+ levels. One block is 14 indents deep due to nested conditionals inside loop bodies inside try blocks.',
      recommendation: 'Apply "guard clause" pattern: return early for error cases. Extract nested loops into generator functions. Use `itertools.product` for combinatorial logic.',
    },
    {
      id: 'cs7', type: 'Unused Imports (flake8 F401)', file: 'src/ (19 instances)', count: 19,
      severity: 'low' as SeverityLevel,
      description: '19 unused imports slow down cold-start import time and clutter the namespace. Several are heavy modules like `torch` and `transformers` imported in files that don\'t use them.',
      recommendation: 'Run `autoflake --remove-all-unused-imports` across the codebase. Add `ruff` with rule F401 to CI to prevent regressions.',
    },
  ],
  dependencies: {
    upToDate: 23,
    outdated: 8,
    vulnerable: 3,
  },
  skillAssessment: [
    { name: 'Python', claimed: 90, actual: 72, trend: -1, verdict: 'overestimated', evidence: 'Code uses procedural patterns where OOP would improve maintainability. Type annotations sparse. Some anti-patterns present.' },
    { name: 'Machine Learning', claimed: 75, actual: 80, trend: 1, verdict: 'underestimated', evidence: 'Embedding pipeline shows solid understanding of vector semantics. HNSW index tuning is non-trivial and well-implemented.' },
    { name: 'System Design', claimed: 60, actual: 55, trend: 0, verdict: 'accurate', evidence: 'Service decomposition is logical but coupling between layers is higher than ideal. Missing circuit breakers on external calls.' },
    { name: 'Security', claimed: 50, actual: 30, trend: -1, verdict: 'overestimated', evidence: 'SQL injection risk and hardcoded secrets indicate security hygiene needs attention. No evidence of threat modeling.' },
    { name: 'FastAPI / Backend', claimed: 80, actual: 65, trend: -1, verdict: 'overestimated', evidence: 'Endpoint structure is clean but middleware ordering is wrong (CORS before auth). Rate limiting missing entirely.' },
  ],
  architectureDetails: {
    couplingScore: 62,
    cohesionScore: 71,
    layerSeparation: 58,
    modularityScore: 74,
    detectedPatterns: ['Repository Pattern', 'Factory Pattern', 'Dependency Injection', 'Strategy Pattern'],
    antiPatterns: ['God Class (IndexerService)', 'Leaky Abstraction (DB Layer)', 'Tight Coupling (Cache → Redis)'],
    layerBreakdown: [
      { layer: 'API / Routes', files: 12, score: 78 },
      { layer: 'Business Logic', files: 34, score: 65 },
      { layer: 'Data Access', files: 18, score: 52 },
      { layer: 'Core / ML', files: 41, score: 83 },
      { layer: 'Utilities', files: 28, score: 70 },
      { layer: 'Tests', files: 54, score: 61 },
    ],
    couplingGraph: [
      { from: 'Data Access', to: 'Business Logic', strength: 87 },
      { from: 'Business Logic', to: 'Core / ML', strength: 64 },
      { from: 'API / Routes', to: 'Business Logic', strength: 72 },
      { from: 'Core / ML', to: 'Utilities', strength: 45 },
      { from: 'Data Access', to: 'Core / ML', strength: 91 },
    ],
  },
  codeQualityDetails: {
    lintScore: 58,
    docCoverage: 31,
    testQuality: 42,
    consistencyScore: 67,
    reviewScore: 55,
    complexityDist: [
      { range: '1–5', count: 89 },
      { range: '6–10', count: 54 },
      { range: '11–20', count: 28 },
      { range: '21–50', count: 12 },
      { range: '50+', count: 4 },
    ],
    testMetrics: {
      totalTests: 87,
      passing: 62,
      failing: 18,
      flaky: 7,
      avgDuration: 3.4,
    },
  },
};

// Rich scan data for fastapi-gateway (Python API repo)
export const mockFastApiGatewayScan: LastScan = {
  overallScore: 82,
  scanDate: '2025-06-28',
  securityScore: 88,
  codeQualityScore: 78,
  architectureScore: 85,
  skillScore: 80,
  metrics: {
    totalFiles: 94,
    linesOfCode: 8241,
    testCoverage: 67,
    avgComplexity: 5.2,
    duplication: 6,
  },
  findings: [
    {
      id: 'g1', severity: 'high' as SeverityLevel,
      title: 'JWT Secret Stored in Environment without Rotation',
      description: 'The JWT signing secret is a 32-char random string set via env var but never rotated. No key versioning or grace period during rotation. If leaked, all tokens are permanently valid.',
      file: 'src/auth/jwt.py', line: 18, tool: 'Bandit',
      recommendation: 'Implement JWT key rotation with kid (key ID) header claims. Store secrets in HashiCorp Vault or AWS Secrets Manager with automatic rotation every 90 days. Maintain a 24h grace window for old keys.'
    },
    {
      id: 'g2', severity: 'medium' as SeverityLevel,
      title: 'Sensitive Error Messages Leak Stack Traces',
      description: 'HTTP 500 responses include full Python tracebacks with file paths and line numbers when `DEBUG=0` is not explicitly set in production.',
      file: 'src/middleware/error_handler.py', line: 34, tool: 'Semgrep',
      recommendation: 'Create a sanitized error response schema that logs full tracebacks server-side but returns only `error_code` and `message` to clients. Use structlog for structured server-side logging.'
    },
    {
      id: 'g3', severity: 'medium' as SeverityLevel,
      title: 'Redis Auth Token Logged at INFO Level',
      description: 'Connection string with Redis password is logged at INFO level on startup in src/cache/redis_client.py:29. Log aggregation systems may retain this indefinitely.',
      file: 'src/cache/redis_client.py', line: 29, tool: 'Bandit',
      recommendation: 'Mask credentials in all log output using a URL sanitizer. Set minimum log level to WARNING for cache initialization. Audit existing log retention policies.'
    },
    {
      id: 'g4', severity: 'low' as SeverityLevel,
      title: 'Missing Content Security Policy Headers',
      description: 'No CSP, X-Frame-Options, or X-Content-Type-Options headers are set on API responses. While primarily a browser concern, it indicates immature security posture.',
      file: 'src/middleware/security.py', line: 1, tool: 'Semgrep',
      recommendation: 'Add a security headers middleware: CSP default-src none; X-Frame-Options DENY; X-Content-Type-Options nosniff; Strict-Transport-Security max-age=31536000. Test with securityheaders.com.'
    },
  ],
  codeSmells: [
    {
      id: 'gc1', type: 'Long Function (127 lines)', file: 'src/gateway/router.py:89', count: 1,
      severity: 'medium' as SeverityLevel,
      description: '`route_request()` handles path matching, auth, rate limiting, caching, upstream selection, retry logic, and response transformation in one 127-line function.',
      recommendation: 'Decompose into a chain of responsibility: `AuthMiddleware`, `RateLimiter`, `CacheLookup`, `UpstreamSelector`, `RetryHandler`, `ResponseTransformer`.',
      codeSnippet: 'def route_request(req):\n    # 127 lines of mixed concerns\n    if not check_auth(req):\n        return 401\n    if rate_limit_exceeded(req):\n        return 429\n    # ... 110 more lines'
    },
    {
      id: 'gc2', type: 'Magic Numbers (11 instances)', file: 'src/config/limits.py', count: 11,
      severity: 'low' as SeverityLevel,
      description: '11 raw numeric literals used as configuration without named constants. Examples: timeout=30, retry=3, batch=1000. These make tuning impossible without code changes.',
      recommendation: 'Define all tunables as `pydantic.BaseSettings` fields with env var fallbacks. Document each with a docstring explaining the tradeoff space.',
    },
    {
      id: 'gc3', type: 'Tight Coupling to Redis', file: 'src/cache/ (8 files)', count: 8,
      severity: 'medium' as SeverityLevel,
      description: '8 files import `redis.Redis` directly instead of using an abstract cache interface. Swapping to Memcached or DynamoDB would require touching every consumer.',
      recommendation: 'Introduce a `CacheBackend` protocol and a `RedisCache` implementation. Inject via FastAPI dependencies. Add a `NullCache` for testing.',
    },
    {
      id: 'gc4', type: 'Inconsistent Error Response Formats', file: 'src/api/ (3 formats)', count: 3,
      severity: 'low' as SeverityLevel,
      description: 'Three different error response schemas across the codebase: Flask-style dicts, FastAPI `HTTPException`, and plain text. Clients must parse all three.',
      recommendation: 'Standardize on a single `ErrorResponse` Pydantic model. Use a global exception handler that converts all errors to this schema.',
    },
  ],
  dependencies: {
    upToDate: 31,
    outdated: 4,
    vulnerable: 1,
  },
  skillAssessment: [
    { name: 'Python', claimed: 90, actual: 85, trend: 0, verdict: 'accurate', evidence: 'Clean use of type hints and Pydantic models. Async/await patterns are correct. Some minor lint issues.' },
    { name: 'System Design', claimed: 60, actual: 70, trend: 1, verdict: 'underestimated', evidence: 'Gateway pattern is well-implemented with circuit breakers and health checks. Load balancing strategy shows thoughtfulness.' },
    { name: 'Security', claimed: 50, actual: 55, trend: 1, verdict: 'accurate', evidence: 'JWT implementation is solid aside from rotation. Rate limiting is present. Headers could be stricter.' },
    { name: 'DevOps / CI/CD', claimed: 40, actual: 35, trend: -1, verdict: 'overestimated', evidence: 'Dockerfile uses `python:latest` instead of pinned version. No multi-stage build. Health check is basic HTTP ping only.' },
  ],
  architectureDetails: {
    couplingScore: 71,
    cohesionScore: 82,
    layerSeparation: 79,
    modularityScore: 83,
    detectedPatterns: ['Gateway Pattern', 'Circuit Breaker', 'Health Check Endpoint', 'Dependency Injection'],
    antiPatterns: ['Tight Coupling (Cache → Redis)', 'Magic Numbers'],
    layerBreakdown: [
      { layer: 'API / Routes', files: 14, score: 86 },
      { layer: 'Auth / Security', files: 8, score: 79 },
      { layer: 'Gateway / Routing', files: 10, score: 88 },
      { layer: 'Cache', files: 6, score: 65 },
      { layer: 'Config', files: 5, score: 72 },
      { layer: 'Tests', files: 51, score: 84 },
    ],
    couplingGraph: [
      { from: 'Gateway / Routing', to: 'Auth / Security', strength: 55 },
      { from: 'API / Routes', to: 'Gateway / Routing', strength: 48 },
      { from: 'Auth / Security', to: 'Cache', strength: 62 },
      { from: 'Gateway / Routing', to: 'Cache', strength: 71 },
    ],
  },
  codeQualityDetails: {
    lintScore: 84,
    docCoverage: 72,
    testQuality: 78,
    consistencyScore: 81,
    reviewScore: 76,
    complexityDist: [
      { range: '1–5', count: 68 },
      { range: '6–10', count: 19 },
      { range: '11–20', count: 5 },
      { range: '21–50', count: 2 },
      { range: '50+', count: 0 },
    ],
    testMetrics: {
      totalTests: 156,
      passing: 148,
      failing: 5,
      flaky: 3,
      avgDuration: 1.2,
    },
  },
};
