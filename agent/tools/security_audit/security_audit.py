"""
Security audit tool — scans the codebase for the top 10 security issues
that AI-generated apps commonly ship with.

Checks (each returns a list of findings with severity + fix prompt):
  1.  exposed_secrets     — hardcoded API keys, tokens, DB URLs in frontend
  2.  rate_limiting       — API routes without rate limiting
  3.  input_validation    — API routes without server-side validation
  4.  role_level_security — routes missing ownership/authorization checks
  5.  auth_setup          — weak password hashing, JWT issues, token storage
  6.  cors_config         — wildcard CORS, missing origin whitelist
  7.  security_headers    — missing helmet/CSP/X-Frame-Options/HSTS
  8.  file_uploads        — no MIME validation, original filenames, no size limits
  9.  error_leaks         — stack traces in responses, raw DB errors
  10. llm_security        — client-side API keys, no prompt injection sanitization

Actions:
  - scan : run all checks on a given path, return structured report
  - list : list available checks (names + descriptions)
  - fix  : return the fix prompt for a specific check (for the AI to apply)
"""

import os
import re
from typing import Any, Dict, List, Optional

from agent.tools.base_tool import BaseTool, ToolResult
from common.log import logger


# ─── check definitions ────────────────────────────────────────────────────

# Each check is a function (path) → list of findings.
# A finding is: {severity, file, line, snippet, description, fix_prompt}

SEVERITY_CRITICAL = "critical"
SEVERITY_WARNING = "warning"
SEVERITY_INFO = "info"


# File extensions to scan (skip binaries, images, etc.)
_SCANABLE_EXTS = {
    ".py", ".js", ".ts", ".jsx", ".tsx", ".vue", ".svelte",
    ".json", ".yaml", ".yml", ".toml", ".env", ".cfg", ".ini", ".conf",
    ".html", ".css", ".md", ".txt", ".sh", ".bash",
}

# Directories to skip
_SKIP_DIRS = {
    "node_modules", ".git", "__pycache__", ".next", "dist", "build",
    ".cache", ".pytest_cache", "venv", ".venv", "env", ".env",
    "static", "assets", "vendor", ".mypy_cache",
}

# Patterns that look like secrets
_SECRET_PATTERNS = [
    # API keys (generic long alphanumeric strings assigned to key-like vars)
    (re.compile(r'(?:api[_-]?key|apikey|secret|token|password|passwd|pwd)\s*[=:]\s*["\'][^"\']{16,}["\']', re.IGNORECASE),
     "Hardcoded secret in variable assignment"),
    # Specific provider patterns
    (re.compile(r'sk-[a-zA-Z0-9]{20,}'), "OpenAI API key pattern"),
    (re.compile(r'ghp_[a-zA-Z0-9]{36,}'), "GitHub personal access token"),
    (re.compile(r'gho_[a-zA-Z0-9]{36,}'), "GitHub OAuth token"),
    (re.compile(r'github_pat_[a-zA-Z0-9_]{22,}'), "GitHub fine-grained PAT"),
    (re.compile(r'AKIA[A-Z0-9]{16}'), "AWS access key ID"),
    (re.compile(r'sk_live_[a-zA-Z0-9]{20,}'), "Stripe live secret key"),
    (re.compile(r'rk_live_[a-zA-Z0-9]{20,}'), "Stripe live restricted key"),
    (re.compile(r'xox[baprs]-[a-zA-Z0-9-]{10,}'), "Slack token"),
    (re.compile(r'AIza[a-zA-Z0-9_-]{35}'), "Google API key"),
    # Database URLs with credentials
    (re.compile(r'(?:postgres|postgresql|mysql|mongodb|redis)://[^:\s]+:[^@\s]+@[^\s\'"]+'), "Database URL with embedded credentials"),
    # JWT secrets (short strings assigned to jwt_secret)
    (re.compile(r'jwt[_-]?secret\s*[=:]\s*["\'][^"\']{8,}["\']', re.IGNORECASE), "Hardcoded JWT secret"),
]

# Files that are "frontend" (secrets here are worst)
_FRONTEND_FILES = {".jsx", ".tsx", ".vue", ".svelte", ".html"}
_FRONTEND_PATTERNS = ["client", "frontend", "browser", "public", "static", "src/components", "src/pages", "src/app"]


def _is_frontend_file(filepath: str) -> bool:
    """Heuristic: is this file likely frontend/client-side code?

    Only returns True for files that are genuinely client-side and publicly
    served. Server-side templates and admin UIs that require auth are NOT
    frontend files (they're behind login).
    """
    ext = os.path.splitext(filepath)[1].lower()
    # Only .jsx/.tsx/.vue/.svelte are definitely client-side component files
    if ext in {".jsx", ".tsx", ".vue", ".svelte"}:
        return True
    lower = filepath.lower().replace("\\", "/")
    # Only flag as frontend if in a clear public/client path
    # Avoid flagging admin UIs, server templates, etc.
    if any(p in lower for p in ["public/", "client/src/", "frontend/src/", "src/components/", "src/pages/"]):
        return True
    return False


def _is_scanable(filepath: str) -> bool:
    ext = os.path.splitext(filepath)[1].lower()
    if ext not in _SCANABLE_EXTS and ext != ".env":
        return False
    # Skip lock files, minified files
    name = os.path.basename(filepath).lower()
    if name.endswith((".lock", ".min.js", ".min.css")):
        return False
    if "package-lock" in name or "yarn.lock" in name or "pnpm-lock" in name:
        return False
    return True


def _walk_codebase(root: str, max_files: int = 5000):
    """Yield (filepath, content) for each scanable file under root."""
    count = 0
    for dirpath, dirnames, filenames in os.walk(root):
        # Prune skip dirs in-place
        dirnames[:] = [d for d in dirnames if d not in _SKIP_DIRS]
        for fname in filenames:
            if count >= max_files:
                return
            fpath = os.path.join(dirpath, fname)
            if not _is_scanable(fpath):
                continue
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                yield (fpath, content)
                count += 1
            except Exception:
                continue


def _line_of(content: str, char_idx: int) -> int:
    """Convert a character index to a 1-based line number."""
    return content.count("\n", 0, char_idx) + 1


# ─── individual checks ────────────────────────────────────────────────────

def _check_exposed_secrets(root: str) -> List[Dict[str, Any]]:
    findings = []
    for fpath, content in _walk_codebase(root):
        is_frontend = _is_frontend_file(fpath)
        for pattern, desc in _SECRET_PATTERNS:
            for m in pattern.finditer(content):
                line = _line_of(content, m.start())
                # Get the line text (for snippet)
                lines = content.split("\n")
                snippet = lines[line - 1].strip() if line <= len(lines) else m.group(0)
                # Mask the secret in the snippet
                masked = re.sub(r'[a-zA-Z0-9]{8,}', '****', snippet)
                severity = SEVERITY_CRITICAL if is_frontend else SEVERITY_WARNING
                findings.append({
                    "check": "exposed_secrets",
                    "severity": severity,
                    "file": os.path.relpath(fpath, root),
                    "line": line,
                    "snippet": masked,
                    "description": f"{desc}" + (" (in frontend file — CRITICAL)" if is_frontend else ""),
                    "fix_prompt": (
                        "Move all hardcoded secrets to a .env file. Add .env to .gitignore. "
                        "Create a .env.example with variable names but empty values. "
                        "Ensure no secret values are returned in API responses. "
                        "For frontend frameworks, only non-secret variables should be prefixed "
                        "with NEXT_PUBLIC_ or VITE_."
                    ),
                })
    # Also check if .env is in .gitignore
    gitignore_path = os.path.join(root, ".gitignore")
    if os.path.exists(gitignore_path):
        with open(gitignore_path, "r", errors="ignore") as f:
            gi = f.read()
        if ".env" not in gi:
            findings.append({
                "check": "exposed_secrets",
                "severity": SEVERITY_CRITICAL,
                "file": ".gitignore",
                "line": 0,
                "snippet": "",
                "description": ".env is NOT in .gitignore — secrets will be committed to git",
                "fix_prompt": "Add .env and .env.local to .gitignore immediately.",
            })
    else:
        findings.append({
            "check": "exposed_secrets",
            "severity": SEVERITY_WARNING,
            "file": ".gitignore",
            "line": 0,
            "snippet": "",
            "description": "No .gitignore file found",
            "fix_prompt": "Create a .gitignore file and add .env, node_modules/, __pycache__/, etc.",
        })
    return findings


def _check_rate_limiting(root: str) -> List[Dict[str, Any]]:
    findings = []
    has_rate_limit = False
    api_routes = []
    for fpath, content in _walk_codebase(root):
        ext = os.path.splitext(fpath)[1].lower()
        # Check for rate limiting libraries
        if "express-rate-limit" in content or "slowapi" in content or \
           "rate_limit" in content.lower() or "ratelimit" in content.lower():
            has_rate_limit = True
        # Find API route definitions
        if ext in (".py", ".js", ".ts", ".jsx", ".tsx"):
            # FastAPI/Flask routes
            for m in re.finditer(r'@(?:app|router)\.(?:get|post|put|delete|patch)\s*\(\s*["\']([^"\']+)', content):
                api_routes.append((os.path.relpath(fpath, root), _line_of(content, m.start()), m.group(1)))
            # Express routes
            for m in re.finditer(r'\.(?:get|post|put|delete|patch)\s*\(\s*["\']([^"\']+)', content):
                api_routes.append((os.path.relpath(fpath, root), _line_of(content, m.start()), m.group(1)))
    if not has_rate_limit and api_routes:
        findings.append({
            "check": "rate_limiting",
            "severity": SEVERITY_CRITICAL,
            "file": "(multiple)",
            "line": 0,
            "snippet": f"{len(api_routes)} API routes found, no rate limiting library detected",
            "description": f"No rate limiting detected. {len(api_routes)} API routes are unprotected.",
            "fix_prompt": (
                "Add rate limiting to all API routes. Use: auth endpoints — 5 req/15min per IP. "
                "General API — 60 req/min per IP. AI/LLM endpoints — 10 req/min per user. "
                "File uploads — 5 req/min per IP. Return 429 with Retry-After header. "
                "For Python/FastAPI use slowapi. For Node/Express use express-rate-limit."
            ),
        })
    elif api_routes:
        # Has some rate limiting but check if it's on auth routes specifically
        auth_routes = [r for r in api_routes if any(w in r[2].lower() for w in ["login", "register", "auth", "password", "signup"])]
        if auth_routes:
            findings.append({
                "check": "rate_limiting",
                "severity": SEVERITY_INFO,
                "file": "(auth routes)",
                "line": 0,
                "snippet": f"{len(auth_routes)} auth routes found",
                "description": f"Rate limiting detected but verify auth routes have stricter limits (5 req/15min).",
                "fix_prompt": "Ensure auth endpoints (login, register, password reset) have 5 req/15min per IP.",
            })
    return findings


def _check_input_validation(root: str) -> List[Dict[str, Any]]:
    findings = []
    has_validation_lib = False
    raw_sql_count = 0
    for fpath, content in _walk_codebase(root):
        # Check for validation libraries
        if "zod" in content.lower() or "pydantic" in content.lower() or \
           "joi" in content.lower() or "validator" in content.lower():
            has_validation_lib = True
        # Check for raw SQL interpolation (dangerous)
        # Only flag if a VARIABLE is being interpolated into the SQL string,
        # NOT if parameterized ? placeholders are being used. Also skip lines
        # that have a "SECURITY: NOT SQL injection" comment nearby.
        ext = os.path.splitext(fpath)[1].lower()
        if ext in (".py", ".js", ".ts"):
            lines = content.split("\n")
            for i, line in enumerate(lines):
                # Skip lines with a SECURITY comment nearby (within 3 lines above)
                has_security_note = any(
                    "SECURITY" in lines[j].upper() and "NOT SQL injection" in lines[j]
                    for j in range(max(0, i - 3), i)
                )
                if has_security_note:
                    continue
                lower_line = line.lower()
                # Only flag execute/query calls that use f-strings with {variable}
                # interpolation AND contain SQL keywords
                if any(kw in lower_line for kw in ["execute", "query", "cursor"]):
                    if ('f"' in line or "f'" in line) and any(
                        kw in lower_line for kw in ["select ", "insert ", "update ", "delete ", "where ", "values"]
                    ):
                        # Check if it's actually interpolating a variable (has {something} that's not just ?)
                        if re.search(r'\{[^}]*\}', line) and "placeholders" not in lower_line:
                            raw_sql_count += 1
                            findings.append({
                                "check": "input_validation",
                                "severity": SEVERITY_CRITICAL,
                                "file": os.path.relpath(fpath, root),
                                "line": i + 1,
                                "snippet": line.strip()[:120],
                                "description": "Possible SQL injection — variable interpolated into raw SQL query",
                                "fix_prompt": (
                                    "Use parameterized queries or ORM methods. Never interpolate user input "
                                    "into raw SQL. Use ? placeholders (SQLite/MySQL) or %s (PostgreSQL) "
                                    "with parameterized execute() calls."
                                ),
                            })
    if not has_validation_lib:
        findings.append({
            "check": "input_validation",
            "severity": SEVERITY_WARNING,
            "file": "(project-wide)",
            "line": 0,
            "snippet": "",
            "description": "No input validation library detected (Zod, Pydantic, Joi, etc.)",
            "fix_prompt": (
                "Add server-side input validation to every API route. Use Zod for JS/TS "
                "or Pydantic for Python. Validate data type, length, allowed characters, "
                "required fields, and enum values. Return 400 for invalid input."
            ),
        })
    return findings


def _check_role_level_security(root: str) -> List[Dict[str, Any]]:
    findings = []
    has_auth_check = False
    has_rls = False
    for fpath, content in _walk_codebase(root):
        lower = content.lower()
        if any(w in lower for w in ["require_auth", "requireauth", "@login_required", "usesession", "getsession", "require_login"]):
            has_auth_check = True
        if "rls" in lower or "row level security" in lower or "policy" in lower and "using" in lower:
            has_rls = True
    if not has_auth_check:
        findings.append({
            "check": "role_level_security",
            "severity": SEVERITY_WARNING,
            "file": "(project-wide)",
            "line": 0,
            "snippet": "",
            "description": "No authentication/authorization middleware detected on routes",
            "fix_prompt": (
                "Add authorization checks to every route that reads, updates, or deletes a resource. "
                "Verify the authenticated user owns the resource. Add role checks on admin routes. "
                "Use row-level security (RLS) in the database where supported. Return 403 Forbidden "
                "when a user accesses something they don't own."
            ),
        })
    return findings


def _check_auth_setup(root: str) -> List[Dict[str, Any]]:
    findings = []
    for fpath, content in _walk_codebase(root):
        lower = content.lower()
        # Plain-text password storage
        if "password" in lower and ("md5" in lower or "sha1" in lower or "base64" in lower) and "bcrypt" not in lower and "argon" not in lower:
            line_idx = lower.find("md5") if "md5" in lower else (lower.find("sha1") if "sha1" in lower else lower.find("base64"))
            findings.append({
                "check": "auth_setup",
                "severity": SEVERITY_CRITICAL,
                "file": os.path.relpath(fpath, root),
                "line": _line_of(content, line_idx),
                "snippet": "",
                "description": "Weak password hashing detected (MD5/SHA1/Base64 instead of bcrypt/argon2)",
                "fix_prompt": "Hash passwords with bcrypt (cost factor ≥ 12) or argon2. Never use MD5, SHA1, or Base64 for passwords.",
            })
        # JWT in localStorage
        if "localstorage" in lower and ("jwt" in lower or "token" in lower):
            line_idx = lower.find("localstorage")
            findings.append({
                "check": "auth_setup",
                "severity": SEVERITY_WARNING,
                "file": os.path.relpath(fpath, root),
                "line": _line_of(content, line_idx),
                "snippet": "",
                "description": "JWT/token stored in localStorage — vulnerable to XSS",
                "fix_prompt": "Store refresh tokens in httpOnly cookies, not localStorage. JWTs should expire in 15-60 minutes.",
            })
        # Weak JWT secret
        for m in re.finditer(r'jwt[_-]?secret\s*[=:]\s*["\']([^"\']{1,31})["\']', content, re.IGNORECASE):
            findings.append({
                "check": "auth_setup",
                "severity": SEVERITY_CRITICAL,
                "file": os.path.relpath(fpath, root),
                "line": _line_of(content, m.start()),
                "snippet": f"JWT secret is only {len(m.group(1))} chars (min 32 required)",
                "description": "JWT secret is too short (minimum 32 characters)",
                "fix_prompt": "Use a JWT secret of at least 32 characters from a secure random source. Store it in an environment variable.",
            })
    return findings


def _check_cors_config(root: str) -> List[Dict[str, Any]]:
    findings = []
    for fpath, content in _walk_codebase(root):
        # Skip this tool's own source (it discusses CORS patterns)
        if "security_audit" in fpath:
            continue
        # Wildcard CORS — only flag actual header SET calls, not discussions
        for m in re.finditer(r"web\.header\s*\(\s*['\"]Access-Control-Allow-Origin['\"]\s*,\s*['\"]\*['\"]\s*\)", content):
            findings.append({
                "check": "cors_config",
                "severity": SEVERITY_CRITICAL,
                "file": os.path.relpath(fpath, root),
                "line": _line_of(content, m.start()),
                "snippet": "Access-Control-Allow-Origin: *",
                "description": "Wildcard CORS (*) allows any website to make requests",
                "fix_prompt": "Replace wildcard CORS with an explicit origin whitelist. Read allowed origins from environment variables. Set 'web_cors_origin' in config.json.",
            })
        # CORS with credentials + wildcard — only flag if both are SET in the same
        # handler, not if they're just mentioned in comments/strings
        has_wildcard_set = bool(re.search(r"web\.header\s*\(\s*['\"]Access-Control-Allow-Origin['\"]\s*,\s*['\"]\*['\"]\s*\)", content))
        has_credentials_set = bool(re.search(r"web\.header\s*\(\s*['\"]Access-Control-Allow-Credentials['\"]\s*,\s*['\"]true['\"]\s*\)", content, re.IGNORECASE))
        if has_wildcard_set and has_credentials_set:
            findings.append({
                "check": "cors_config",
                "severity": SEVERITY_CRITICAL,
                "file": os.path.relpath(fpath, root),
                "line": 0,
                "snippet": "",
                "description": "CORS credentials enabled with wildcard origin",
                "fix_prompt": "Never combine credentials:true with wildcard origin. Specify explicit origins when credentials are enabled.",
            })
    return findings


def _check_security_headers(root: str) -> List[Dict[str, Any]]:
    findings = []
    has_helmet = False
    has_csp = False
    for fpath, content in _walk_codebase(root):
        lower = content.lower()
        if "helmet" in lower:
            has_helmet = True
        if "content-security-policy" in lower or "content_security_policy" in lower:
            has_csp = True
    if not has_helmet and not has_csp:
        findings.append({
            "check": "security_headers",
            "severity": SEVERITY_WARNING,
            "file": "(project-wide)",
            "line": 0,
            "snippet": "",
            "description": "No security headers library detected (helmet, CSP, etc.)",
            "fix_prompt": (
                "Add security headers using helmet (Node.js) or equivalent. Set: "
                "Content-Security-Policy, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, "
                "Strict-Transport-Security, Referrer-Policy: strict-origin-when-cross-origin. "
                "Remove X-Powered-By header."
            ),
        })
    return findings


def _check_file_uploads(root: str) -> List[Dict[str, Any]]:
    findings = []
    for fpath, content in _walk_codebase(root):
        lower = content.lower()
        if any(w in lower for w in ["multer", "upload", "filefield", "request.files", "upload_file", "save_upload"]):
            # Check for MIME validation
            has_mime_check = "mimetype" in lower or "mime_type" in lower or "content_type" in lower
            has_size_limit = "max_size" in lower or "maxsize" in lower or "limit" in lower and "size" in lower
            has_uuid_rename = "uuid" in lower
            if not has_mime_check:
                findings.append({
                    "check": "file_uploads",
                    "severity": SEVERITY_WARNING,
                    "file": os.path.relpath(fpath, root),
                    "line": 0,
                    "snippet": "",
                    "description": "File upload detected without MIME type validation",
                    "fix_prompt": "Validate file type by MIME type AND extension on the server. Set size limits: 5MB images, 25MB docs. Rename files to UUIDs.",
                })
            if not has_uuid_rename:
                findings.append({
                    "check": "file_uploads",
                    "severity": SEVERITY_INFO,
                    "file": os.path.relpath(fpath, root),
                    "line": 0,
                    "snippet": "",
                    "description": "File upload detected — consider renaming files to UUIDs",
                    "fix_prompt": "Rename every uploaded file to a UUID. Never use the original filename.",
                })
    return findings


def _check_error_leaks(root: str) -> List[Dict[str, Any]]:
    findings = []
    for fpath, content in _walk_codebase(root):
        # Returning stack traces or raw errors to users
        for m in re.finditer(r'(?:return|res\.json|res\.send|response\.json)\s*\([^)]*(?:stack|traceback|str\(e\)|str\(err\)|error\.message)', content, re.IGNORECASE):
            line = _line_of(content, m.start())
            lines = content.split("\n")
            snippet = lines[line - 1].strip()[:120] if line <= len(lines) else ""
            findings.append({
                "check": "error_leaks",
                "severity": SEVERITY_WARNING,
                "file": os.path.relpath(fpath, root),
                "line": line,
                "snippet": snippet,
                "description": "Raw error/stack trace may be returned to user",
                "fix_prompt": "Replace raw error responses with generic messages ('Something went wrong'). Log full errors server-side. Use Sentry for production error tracking.",
            })
    return findings


def _check_llm_security(root: str) -> List[Dict[str, Any]]:
    findings = []
    for fpath, content in _walk_codebase(root):
        is_frontend = _is_frontend_file(fpath)
        lower = content.lower()
        # LLM API key in frontend
        if is_frontend and any(w in lower for w in ["openai", "anthropic", "claude", "gemini", "gpt"]):
            if any(w in lower for w in ["api_key", "apikey", "api-key"]):
                findings.append({
                    "check": "llm_security",
                    "severity": SEVERITY_CRITICAL,
                    "file": os.path.relpath(fpath, root),
                    "line": 0,
                    "snippet": "",
                    "description": "LLM API key referenced in frontend file — must be server-side only",
                    "fix_prompt": "Move all LLM API keys to server-side environment variables. Route all LLM calls through your backend. Never expose API keys in frontend code.",
                })
        # No max_tokens limit
        if any(w in lower for w in ["openai", "anthropic", "chat.completions", "messages.create"]):
            if "max_tokens" not in lower and "maxoutputtokens" not in lower:
                findings.append({
                    "check": "llm_security",
                    "severity": SEVERITY_WARNING,
                    "file": os.path.relpath(fpath, root),
                    "line": 0,
                    "snippet": "",
                    "description": "LLM call without max_tokens limit — cost attack risk",
                    "fix_prompt": "Set max_tokens on every LLM call. Add per-user token budgets. Log token usage per user.",
                })
    return findings


# ─── check registry ───────────────────────────────────────────────────────

CHECKS = [
    {"id": "exposed_secrets",     "name": "Exposed Secrets",         "fn": _check_exposed_secrets},
    {"id": "rate_limiting",       "name": "Rate Limiting",           "fn": _check_rate_limiting},
    {"id": "input_validation",    "name": "Input Validation",        "fn": _check_input_validation},
    {"id": "role_level_security", "name": "Role-Level Security",     "fn": _check_role_level_security},
    {"id": "auth_setup",          "name": "Auth Setup",              "fn": _check_auth_setup},
    {"id": "cors_config",         "name": "CORS Configuration",      "fn": _check_cors_config},
    {"id": "security_headers",    "name": "Security Headers",        "fn": _check_security_headers},
    {"id": "file_uploads",        "name": "File Uploads",            "fn": _check_file_uploads},
    {"id": "error_leaks",         "name": "Error Leaks",             "fn": _check_error_leaks},
    {"id": "llm_security",        "name": "LLM Security",            "fn": _check_llm_security},
]


# ─── the tool ─────────────────────────────────────────────────────────────

class SecurityAuditTool(BaseTool):
    """
    Security audit — scans the codebase for the top 10 security issues
    that AI-generated apps commonly ship with.

    Actions:
      - scan : run all checks, return structured report
      - list : list available checks
      - fix  : return the fix prompt for a specific check
    """

    name: str = "security_audit"
    description: str = (
        "Scan the codebase for security vulnerabilities. Checks for: "
        "exposed secrets, missing rate limiting, missing input validation, "
        "missing role-level security, weak auth setup, CORS misconfiguration, "
        "missing security headers, unsafe file uploads, error leaks, and "
        "LLM-specific security issues.\n\n"
        "Actions:\n"
        "  - scan : run all 10 checks on a path, return structured report\n"
        "  - list : list available checks\n"
        "  - fix  : return fix prompt for a specific check\n\n"
        "Each finding includes: severity (critical/warning/info), file, line, "
        "snippet, description, and a ready-to-use fix prompt."
    )

    params: dict = {
        "type": "object",
        "properties": {
            "action": {
                "type": "string",
                "enum": ["scan", "list", "fix"],
                "description": "Operation to perform.",
            },
            "path": {
                "type": "string",
                "description": "scan: directory path to scan (defaults to workspace root).",
            },
            "check_id": {
                "type": "string",
                "description": "fix: which check to get the fix prompt for.",
            },
        },
        "required": ["action"],
    }

    def __init__(self, config: dict = None):
        super().__init__()
        self.config = config or {}
        self.workspace = self.config.get("workspace") if isinstance(self.config, dict) else None

    def execute(self, params: dict) -> ToolResult:
        action = params.get("action")
        try:
            if action == "scan":
                return ToolResult.success(self._action_scan(params))
            elif action == "list":
                return ToolResult.success(self._action_list(params))
            elif action == "fix":
                return ToolResult.success(self._action_fix(params))
            return ToolResult.fail(f"Unknown action: {action}")
        except Exception as e:
            logger.error(f"[SecurityAuditTool] {action} failed: {e}", exc_info=True)
            return ToolResult.fail(f"Security audit failed: {e}")

    def _action_scan(self, p: dict) -> Dict[str, Any]:
        scan_path = (p.get("path") or "").strip()
        if not scan_path:
            scan_path = self.workspace or os.path.expanduser("~/onyx")
        scan_path = os.path.expanduser(scan_path)
        if not os.path.isdir(scan_path):
            return {"component": "security-report", "error": f"Path not found: {scan_path}"}

        all_findings: List[Dict[str, Any]] = []
        check_results: List[Dict[str, Any]] = []

        for check in CHECKS:
            try:
                findings = check["fn"](scan_path)
            except Exception as e:
                logger.error(f"[SecurityAuditTool] check {check['id']} failed: {e}")
                findings = []
            critical = sum(1 for f in findings if f["severity"] == SEVERITY_CRITICAL)
            warnings = sum(1 for f in findings if f["severity"] == SEVERITY_WARNING)
            info = sum(1 for f in findings if f["severity"] == SEVERITY_INFO)
            status = "fail" if critical > 0 else ("warning" if warnings > 0 else "pass")
            check_results.append({
                "id": check["id"],
                "name": check["name"],
                "status": status,
                "critical": critical,
                "warnings": warnings,
                "info": info,
                "findings": findings,
            })
            all_findings.extend(findings)

        total_critical = sum(1 for f in all_findings if f["severity"] == SEVERITY_CRITICAL)
        total_warnings = sum(1 for f in all_findings if f["severity"] == SEVERITY_WARNING)
        total_info = sum(1 for f in all_findings if f["severity"] == SEVERITY_INFO)
        overall_status = "fail" if total_critical > 0 else ("warning" if total_warnings > 0 else "pass")

        return {
            "component": "security-report",
            "scan_path": scan_path,
            "overall_status": overall_status,
            "summary": {
                "critical": total_critical,
                "warnings": total_warnings,
                "info": total_info,
                "total": len(all_findings),
                "checks_passed": sum(1 for c in check_results if c["status"] == "pass"),
                "checks_total": len(check_results),
            },
            "checks": check_results,
            "pre_launch_checklist": [
                {"item": ".env is not committed to git", "check": "exposed_secrets"},
                {"item": "All secrets are in environment config", "check": "exposed_secrets"},
                {"item": "Debug mode is off in production", "check": "error_leaks"},
                {"item": "Database is not publicly exposed", "check": "role_level_security"},
                {"item": "HTTPS is enforced", "check": "security_headers"},
                {"item": "Rate limiting is active on all endpoints", "check": "rate_limiting"},
                {"item": "CORS is restricted to known origins", "check": "cors_config"},
                {"item": "Role-level security is active", "check": "role_level_security"},
                {"item": "Error messages show nothing internal", "check": "error_leaks"},
            ],
        }

    def _action_list(self, p: dict) -> Dict[str, Any]:
        return {
            "component": "security-check-list",
            "checks": [{"id": c["id"], "name": c["name"]} for c in CHECKS],
        }

    def _action_fix(self, p: dict) -> Dict[str, Any]:
        check_id = (p.get("check_id") or "").strip()
        if not check_id:
            return {"error": "check_id is required for fix action"}
        check = next((c for c in CHECKS if c["id"] == check_id), None)
        if check is None:
            return {"error": f"Unknown check: {check_id}"}
        # Run the check to get the fix prompts from findings
        scan_path = self.workspace or os.path.expanduser("~/onyx")
        findings = check["fn"](scan_path)
        fix_prompts = list(set(f["fix_prompt"] for f in findings if f.get("fix_prompt")))
        return {
            "check_id": check_id,
            "check_name": check["name"],
            "findings_count": len(findings),
            "fix_prompts": fix_prompts,
        }
