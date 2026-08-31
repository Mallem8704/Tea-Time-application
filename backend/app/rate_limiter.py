import time
from collections import defaultdict
from fastapi import Request, HTTPException, status

class RateLimiter:
    """In-memory sliding-window rate limiter for FastAPI routes."""
    def __init__(self, requests_per_minute: int = 60, name: str = "default"):
        self.requests_per_minute = requests_per_minute
        self.name = name
        self.window_seconds = 60
        self.ip_records = defaultdict(list)

    def _clean_old_records(self, ip: str, current_time: float):
        cutoff = current_time - self.window_seconds
        self.ip_records[ip] = [t for t in self.ip_records[ip] if t > cutoff]

    def check(self, request: Request):
        # Extract client IP (handle proxies & Cloudflare headers)
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "unknown"

        now = time.time()
        self._clean_old_records(client_ip, now)

        if len(self.ip_records[client_ip]) >= self.requests_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded for {self.name}. Please wait a moment before trying again.",
            )

        self.ip_records[client_ip].append(now)
        return True


# Standard limiters for public endpoints
order_creation_limiter = RateLimiter(requests_per_minute=20, name="order_creation")
service_call_limiter = RateLimiter(requests_per_minute=10, name="service_calls")
general_api_limiter = RateLimiter(requests_per_minute=120, name="api")
