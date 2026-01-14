from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, Tuple
from fastapi import HTTPException, Request
import threading

class RateLimiter:
    """
    Simple in-memory rate limiter by IP address.
    Tracks request counts per IP within a sliding time window.
    """

    def __init__(self):
        # Structure: {ip: [(timestamp, action), ...]}
        self.requests: Dict[str, list] = defaultdict(list)
        self.lock = threading.Lock()

        # Rate limit configurations
        self.limits = {
            "upload": {"max_requests": 5, "window_minutes": 60},
            "insights": {"max_requests": 3, "window_minutes": 60},
        }

    def _cleanup_old_requests(self, ip: str, action: str):
        """Remove requests older than the window."""
        window = timedelta(minutes=self.limits[action]["window_minutes"])
        cutoff = datetime.now() - window

        self.requests[ip] = [
            (ts, act) for ts, act in self.requests[ip]
            if ts > cutoff
        ]

    def _count_requests(self, ip: str, action: str) -> int:
        """Count requests for a specific action within the window."""
        return sum(1 for _, act in self.requests[ip] if act == action)

    def check_rate_limit(self, ip: str, action: str) -> Tuple[bool, int]:
        """
        Check if request is allowed.
        Returns (allowed, remaining_requests).
        """
        if action not in self.limits:
            return True, -1

        with self.lock:
            self._cleanup_old_requests(ip, action)
            current_count = self._count_requests(ip, action)
            max_requests = self.limits[action]["max_requests"]

            if current_count >= max_requests:
                return False, 0

            return True, max_requests - current_count - 1

    def record_request(self, ip: str, action: str):
        """Record a request for rate limiting."""
        with self.lock:
            self.requests[ip].append((datetime.now(), action))

    def get_reset_time(self, ip: str, action: str) -> int:
        """Get seconds until rate limit resets."""
        if not self.requests[ip]:
            return 0

        window = timedelta(minutes=self.limits[action]["window_minutes"])
        oldest_relevant = None

        for ts, act in self.requests[ip]:
            if act == action:
                if oldest_relevant is None or ts < oldest_relevant:
                    oldest_relevant = ts

        if oldest_relevant is None:
            return 0

        reset_time = oldest_relevant + window
        seconds_remaining = (reset_time - datetime.now()).total_seconds()
        return max(0, int(seconds_remaining))


# Singleton instance
rate_limiter = RateLimiter()


def get_client_ip(request: Request) -> str:
    """Extract client IP from request, handling proxies."""
    # Check for forwarded headers (Railway/proxies)
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()

    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip

    return request.client.host if request.client else "unknown"


def check_rate_limit(action: str):
    """
    Dependency for FastAPI routes to check rate limits.
    Usage: @router.post("/upload", dependencies=[Depends(check_rate_limit("upload"))])
    """
    async def rate_limit_dependency(request: Request):
        ip = get_client_ip(request)
        allowed, remaining = rate_limiter.check_rate_limit(ip, action)

        if not allowed:
            reset_seconds = rate_limiter.get_reset_time(ip, action)
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "Rate limit exceeded",
                    "action": action,
                    "retry_after_seconds": reset_seconds,
                    "message": f"Too many {action} requests. Please try again in {reset_seconds // 60} minutes."
                }
            )

        # Record this request
        rate_limiter.record_request(ip, action)

        # Add remaining count to response headers via request state
        request.state.rate_limit_remaining = remaining

    return rate_limit_dependency
