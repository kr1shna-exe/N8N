import os

import redis

redis_password = os.getenv("REDIS_PASSWORD")
use_ssl = redis_password is not None

redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", "6379")),
    password=redis_password,
    decode_responses=True,
    ssl=use_ssl,
    ssl_cert_reqs=None if use_ssl else "none",
)
