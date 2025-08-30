# 🚀 Quick Start: N8N + Chennai EMS Integration

Get your Chennai Emergency Ambulance Routing System connected to N8N in 5 minutes!

## Step 1: Set Your Environment Variables

In Replit, add these secrets:

```bash
N8N_API_KEY=emergency_api_key_2025_secure
N8N_WEBHOOK_SECRET=webhook_secret_chennai_ems_2025
```

## Step 2: Test Your Integration

### Test Emergency Dispatch
```bash
curl -X POST https://your-replit-app.replit.app/webhook/n8n/emergency \
  -H "X-API-Key: emergency_api_key_2025_secure" \
  -H "Content-Type: application/json" \
  -d '{
    "location": "T.Nagar, Chennai",
    "latitude": 13.0418,
    "longitude": 80.2341,
    "emergency_type": "trauma",
    "priority": "critical",
    "external_id": "test-001"
  }'
```

### Check System Status
```bash
curl https://your-replit-app.replit.app/webhook/n8n/hospitals/status
```

## Step 3: Import N8N Workflows

1. Copy workflows from `n8n-integration/workflows/` folder
2. Import into your N8N instance
3. Configure credentials:
   - **Twilio** (for SMS alerts)
   - **Slack** (for team notifications)
   - **Chennai EMS API** credentials

## Step 4: Configure N8N Environment

In your N8N instance, set these environment variables:

```bash
CHENNAI_EMS_BASE_URL=https://your-replit-app.replit.app
N8N_API_KEY=emergency_api_key_2025_secure
```

## Step 5: Available Workflows

### 🚨 Emergency Dispatch Workflow
- **Trigger:** Webhook `/emergency-alert`
- **Actions:** 
  - Creates emergency call in Chennai EMS
  - Sends SMS to dispatch team
  - Posts to Slack emergency channel
  - Auto-assigns nearest hospital

### 🏥 Hospital Capacity Monitor
- **Trigger:** Every 5 minutes
- **Actions:**
  - Checks hospital availability
  - Monitors ambulance fleet
  - Alerts if capacity drops below 50%
  - Makes emergency calls for critical situations

## Quick Test Commands

### Test Emergency Call
```bash
# Test from N8N webhook
curl -X POST http://your-n8n-instance/webhook/emergency-alert \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Anna Salai, Chennai",
    "latitude": 13.0605,
    "longitude": 80.2496,
    "emergency_type": "medical",
    "priority": "high",
    "caller_name": "Test User",
    "phone_number": "+91XXXXXXXXXX"
  }'
```

### Update Hospital Availability
```bash
curl -X PATCH https://your-replit-app.replit.app/webhook/n8n/hospitals/apollo_greams/availability \
  -H "X-API-Key: emergency_api_key_2025_secure" \
  -H "Content-Type: application/json" \
  -d '{"available": false, "reason": "Emergency capacity reached"}'
```

### Send Traffic Alert
```bash
curl -X POST https://your-replit-app.replit.app/webhook/n8n/traffic/alert \
  -H "X-API-Key: emergency_api_key_2025_secure" \
  -H "Content-Type: application/json" \
  -d '{
    "zone_name": "T.Nagar Commercial Area",
    "severity": "high",
    "duration_minutes": 30,
    "affected_routes": ["Anna Salai", "Pondy Bazaar"]
  }'
```

## 🔐 Security Notes

- Use environment variables for all API keys
- N8N webhooks support multiple authentication methods
- Enable HTTPS for production deployments
- Regularly rotate API keys and webhook secrets

## 🆘 Emergency Integration Examples

### SMS Alert System
```javascript
// N8N Function Node
const emergency = $json.data;
const message = `🚨 EMERGENCY: ${emergency.emergency_type.toUpperCase()}
Location: ${emergency.location}
Hospital: ${emergency.recommended_hospital.name}
ETA: ${emergency.estimated_dispatch_time} min`;

return [{json: {message, to: '+91XXXXXXXXXX'}}];
```

### Slack Alert
```javascript
// N8N Slack Node Message
🚨 *Emergency Dispatch Alert*

*Type:* {{$json.emergency_type.toUpperCase()}}
*Location:* {{$json.location}}
*Hospital:* {{$json.recommended_hospital.name}}
*ETA:* {{$json.estimated_dispatch_time}} minutes

<{{$env.CHENNAI_EMS_BASE_URL}}|View Dashboard>
```

## Ready to Go! 🎉

Your Chennai EMS system is now integrated with N8N for:
- ✅ Automated emergency dispatch
- ✅ Real-time hospital monitoring
- ✅ SMS/Slack/Discord alerts
- ✅ Traffic-aware routing
- ✅ Multi-channel notifications

Need help? Check the full README.md for detailed documentation!