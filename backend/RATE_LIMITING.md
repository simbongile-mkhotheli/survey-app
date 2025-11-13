# Rate Limiting - Production Best Practices

## Overview

This application uses **Redis-based distributed rate limiting** with automatic fallback to in-memory storage.

## Architecture

### Redis Mode (Production - Recommended)

- ✅ Shared state across all server instances
- ✅ Persistent across server restarts
- ✅ Scales horizontally with multiple instances
- ✅ Industry-standard approach

### In-Memory Mode (Development/Fallback)

- ⚠️ Per-instance rate limiting (not shared)
- ⚠️ Resets on server restart
- ✅ No external dependencies
- ✅ Automatic fallback if Redis fails

## Configuration

### Environment Variables

```bash
# Enable/Disable Redis
REDIS_ENABLED=true

# Redis Connection
REDIS_HOST=your-redis-host.com
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Rate Limit Settings
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100      # 100 requests per IP per window
```

### Recommended Settings by Use Case

#### 1. High-Traffic Public API

```bash
RATE_LIMIT_WINDOW_MS=3600000     # 1 hour
RATE_LIMIT_MAX_REQUESTS=5000     # 5000 requests/hour
```

#### 2. Moderate Traffic (Current Default)

```bash
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100      # 100 requests/15min
```

#### 3. Strict Security

```bash
RATE_LIMIT_WINDOW_MS=60000       # 1 minute
RATE_LIMIT_MAX_REQUESTS=10       # 10 requests/minute
```

#### 4. Development/Testing

```bash
REDIS_ENABLED=false              # Use in-memory
RATE_LIMIT_MAX_REQUESTS=1000     # Generous limit
```

## Deployment

### Vercel

1. Go to your backend project → **Settings** → **Environment Variables**
2. Add:
   ```
   REDIS_ENABLED=true
   REDIS_HOST=your-redis-host
   REDIS_PORT=6379
   REDIS_PASSWORD=your-redis-password
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```
3. Redeploy

**Redis Providers for Vercel:**

- [Upstash Redis](https://upstash.com/) (Serverless, free tier)
- [Redis Cloud](https://redis.com/try-free/)

### Railway

1. Add Redis service: `railway add redis`
2. Set environment variables in Railway dashboard
3. Railway auto-configures `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
4. Just set:
   ```
   REDIS_ENABLED=true
   RATE_LIMIT_MAX_REQUESTS=100
   ```

### Render

1. Add Redis instance (Render Redis or external)
2. In backend service → **Environment** → Add:
   ```
   REDIS_ENABLED=true
   REDIS_URL=redis://your-redis-url
   RATE_LIMIT_MAX_REQUESTS=100
   ```

### Docker Compose (Self-Hosted)

Already configured in your docker-compose.yml:

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

  backend:
    environment:
      REDIS_ENABLED: 'true'
      REDIS_HOST: redis
      REDIS_PORT: 6379
```

## Monitoring

### Rate Limit Headers

Every API response includes:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2025-11-11T15:30:00.000Z
```

### When Rate Limited (HTTP 429)

```json
{
  "error": {
    "message": "Too many requests from this IP",
    "type": "RateLimitError",
    "retryAfter": "300 seconds"
  }
}
```

### Check Redis Connection

In your logs, look for:

```
✅ Redis connected for rate limiting
```

Or if Redis is disabled:

```
Redis disabled, using in-memory rate limiting
```

## Troubleshooting

### Issue: Rate limits not shared across instances

**Problem:** Multiple server instances, each has separate in-memory limits

**Solution:** Enable Redis:

```bash
REDIS_ENABLED=true
# Add Redis connection details
```

### Issue: Redis connection errors

**Problem:** Can't connect to Redis server

**Auto-Fallback:** The system automatically falls back to in-memory mode

**Fix:** Check Redis credentials:

```bash
# Test connection
redis-cli -h your-host -p 6379 -a your-password ping
```

### Issue: Too strict rate limiting

**Problem:** Legitimate users getting blocked

**Solution:** Increase limits:

```bash
RATE_LIMIT_MAX_REQUESTS=500
```

### Issue: Not strict enough

**Problem:** Abuse or DDoS attempts

**Solution:** Tighten limits:

```bash
RATE_LIMIT_WINDOW_MS=60000        # 1 minute
RATE_LIMIT_MAX_REQUESTS=20        # 20 requests/min
```

## Testing

### Test Rate Limiting

```bash
# Send 105 requests quickly
for i in {1..105}; do
  curl http://localhost:5000/api/survey
  echo "Request $i"
done
```

After 100 requests, you should see HTTP 429 responses.

### Test Redis Connection

```bash
# Check if Redis is being used (look in logs)
npm run dev

# Should see either:
# ✅ Redis connected for rate limiting
# OR
# Redis disabled, using in-memory rate limiting
```

## Performance Impact

- **Redis mode**: ~1-2ms latency per request
- **In-memory mode**: <0.1ms per request
- **Memory usage (in-memory)**: ~100 bytes per IP address tracked

## Security Considerations

1. **IP Spoofing**: Ensure `SECURITY_TRUST_PROXY=true` if behind a proxy
2. **Distributed Attacks**: Redis mode protects against coordinated attacks
3. **Redis Security**: Always use password authentication and TLS in production
4. **Rate Limit Bypass**: Consider additional auth-based rate limiting for authenticated users

## Best Practices

✅ **DO:**

- Enable Redis for production
- Use environment variables for configuration
- Monitor rate limit metrics
- Set appropriate limits for your use case
- Test rate limiting before deploying

❌ **DON'T:**

- Hardcode rate limits in production
- Use in-memory mode with multiple instances
- Set limits too high (defeats the purpose)
- Ignore Redis connection errors

## Future Enhancements

Consider implementing:

- Per-user rate limiting (different limits for authenticated users)
- Endpoint-specific rate limits (stricter for auth endpoints)
- Dynamic rate limiting based on server load
- Rate limit exemptions for trusted IPs
- Sliding window instead of fixed window
