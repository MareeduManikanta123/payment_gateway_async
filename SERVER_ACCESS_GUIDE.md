# Payment Gateway - Server Access Guide

## 🚀 Server is Running!

Your payment gateway system is now running. Here's how to access everything:

---

## 📊 Dashboard (Frontend)
**URL:** http://localhost:3000/dashboard
- Dashboard overview
- Transaction history
- Webhook configuration
- API documentation

**Credentials:**
- Email: `test@example.com`
- Password: Any password works in test mode

---

## 🔌 API Server
**URL:** http://localhost:8000
- Base endpoint for all API calls
- Health check: http://localhost:8000/health

**Available Endpoints:**
- `GET /` - API information
- `GET /health` - Health check
- `GET /api/v1/test/merchant` - Test merchant info
- `GET /api/v1/test/jobs/status` - Job queue status
- `POST /api/v1/orders` - Create order
- `POST /api/v1/payments` - Create payment
- `GET /api/v1/payments/:id` - Get payment
- `POST /api/v1/payments/:id/refunds` - Create refund
- `GET /api/v1/webhooks` - Webhook logs

---

## 💳 Checkout Page
**URL:** http://localhost:3001/checkout
- Embeddable payment form
- Can be opened via SDK

---

## 🎯 Testing the API

### Test Credentials
```
API Key: key_test_abc123
API Secret: secret_test_xyz789
```

### Example: Create an Order
```bash
curl -X POST http://localhost:8000/api/v1/orders \
  -H "X-Api-Key: key_test_abc123" \
  -H "X-Api-Secret: secret_test_xyz789" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "currency": "INR",
    "receipt": "rcpt_123"
  }'
```

### Example: Create a Payment
```bash
curl -X POST http://localhost:8000/api/v1/payments \
  -H "X-Api-Key: key_test_abc123" \
  -H "X-Api-Secret: secret_test_xyz789" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "order_abc123",
    "method": "upi",
    "vpa": "user@paytm"
  }'
```

### Check Job Status
```bash
curl http://localhost:8000/api/v1/test/jobs/status
```

Response:
```json
{
  "pending": 0,
  "processing": 0,
  "completed": 15,
  "failed": 0,
  "worker_status": "running"
}
```

---

## 🐳 Docker Containers Running

- **postgres** (Port 5432) - Database
- **redis** (Port 6379) - Job queue
- **api** (Port 8000) - API server
- **worker** - Background job processor
- **dashboard** (Port 3000) - Admin dashboard
- **checkout** (Port 3001) - Payment checkout page

### View Container Logs
```bash
# API logs
docker logs gateway_api -f

# Worker logs
docker logs gateway_worker -f

# All logs
docker-compose -f "m:\GPP_work\GPP\Payment-Gateway_async\payment-gateway-2.o\docker-compose.yml" logs -f
```

---

## 🔍 Monitoring

### Database
- **Host:** localhost:5432
- **Database:** payment_gateway
- **User:** gateway_user
- **Password:** gateway_pass

You can connect with tools like:
- DBeaver
- pgAdmin
- psql CLI

### Redis
- **Host:** localhost:6379
- **Tool:** redis-cli or RedisInsight

Check queue stats:
```bash
docker exec redis_gateway redis-cli
> KEYS *
> LRANGE bull:payment-processing:wait 0 -1
> LRANGE bull:webhook-delivery:wait 0 -1
> LRANGE bull:refund-processing:wait 0 -1
```

---

## ✅ Quick Verification

Run this to verify everything is working:

```bash
# Check API health
curl http://localhost:8000/health

# Check test merchant
curl http://localhost:8000/api/v1/test/merchant

# Check job queue
curl http://localhost:8000/api/v1/test/jobs/status
```

---

## 🛑 Stopping the Server

```bash
# Stop all containers
docker-compose -f "m:\GPP_work\GPP\Payment-Gateway_async\payment-gateway-2.o\docker-compose.yml" down

# Stop and remove volumes
docker-compose -f "m:\GPP_work\GPP\Payment-Gateway_async\payment-gateway-2.o\docker-compose.yml" down -v
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find what's using the port
netstat -ano | findstr :8000

# Kill the process
taskkill /PID <PID> /F
```

### Docker Issues
```bash
# Rebuild images
docker-compose -f "m:\GPP_work\GPP\Payment-Gateway_async\payment-gateway-2.o\docker-compose.yml" build --no-cache

# Restart services
docker-compose -f "m:\GPP_work\GPP\Payment-Gateway_async\payment-gateway-2.o\docker-compose.yml" restart
```

### Check Container Health
```bash
docker-compose -f "m:\GPP_work\GPP\Payment-Gateway_async\payment-gateway-2.o\docker-compose.yml" ps

# Inspect a container
docker inspect gateway_api
```

