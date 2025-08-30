# N8N Integration for Chennai Emergency Ambulance Routing System

This guide will help you integrate the Chennai Emergency Ambulance Routing System with N8N for automated emergency dispatch workflows.

## 🚀 Quick Setup

### 1. Environment Variables

Set these environment variables in your N8N instance:

```bash
# Chennai EMS API Configuration
CHENNAI_EMS_BASE_URL=https://your-replit-app.replit.app
N8N_API_KEY=your-secure-api-key-here
N8N_WEBHOOK_SECRET=your-webhook-secret-here
```

### 2. Available Webhooks

#### Emergency Dispatch Webhook
**POST** `/webhook/n8n/emergency`

Triggers emergency call creation and hospital routing.

**Headers:**
- `X-API-Key: your-api-key` OR
- `Authorization: Bearer your-api-key` OR  
- `X-N8N-Webhook-Auth: your-webhook-secret`

**Body:**
```json
{
  "location": "T.Nagar, Chennai",
  "latitude": 13.0418,
  "longitude": 80.2341,
  "emergency_type": "medical", // or "trauma"
  "priority": "critical", // "critical", "high", "medium"
  "webhook_id": "optional-webhook-id",
  "external_id": "your-external-reference"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "emergency_id": "uuid",
    "nearest_hospitals": [...],
    "estimated_dispatch_time": 8,
    "recommended_hospital": {...}
  },
  "timestamp": "2025-08-30T01:40:00.000Z"
}
```

#### Hospital Status Check
**GET** `/webhook/n8n/hospitals/status`

Gets current hospital and ambulance availability.

**Response:**
```json
{
  "success": true,
  "data": {
    "hospitals": [...],
    "ambulances": {
      "total": 8,
      "available": 6,
      "en_route": 2,
      "maintenance": 0
    },
    "system_status": "operational"
  }
}
```

#### Update Hospital Availability
**PATCH** `/webhook/n8n/hospitals/:hospital_id/availability`

**Body:**
```json
{
  "available": false,
  "reason": "Emergency capacity reached"
}
```

#### Traffic Alert
**POST** `/webhook/n8n/traffic/alert`

**Body:**
```json
{
  "zone_name": "T.Nagar Commercial Area",
  "severity": "high", // "low", "moderate", "high", "severe"
  "duration_minutes": 45,
  "affected_routes": ["Anna Salai", "Pondy Bazaar"]
}
```

#### Ambulance Dispatch
**POST** `/webhook/n8n/ambulance/dispatch`

**Body:**
```json
{
  "emergency_id": "uuid",
  "hospital_id": "apollo_greams",
  "ambulance_id": "AMB001",
  "external_reference": "ticket-12345"
}
```

## 📋 Common N8N Workflows

### 1. Emergency SMS Alert Workflow
1. **Webhook Node** - Receive emergency call
2. **Code Node** - Format emergency details
3. **Twilio Node** - Send SMS to dispatch team
4. **HTTP Request Node** - Notify Chennai EMS system

### 2. Hospital Capacity Monitor
1. **Cron Trigger** - Every 5 minutes
2. **HTTP Request Node** - Check hospital status
3. **IF Node** - Check capacity thresholds
4. **Slack Node** - Alert if capacity low

### 3. Traffic-Based Routing
1. **Webhook Node** - Emergency call received
2. **HTTP Request Node** - Get current traffic data
3. **Code Node** - Calculate optimal route
4. **HTTP Request Node** - Update routing in Chennai EMS

### 4. Multi-Hospital Notification
1. **Webhook Node** - Critical emergency
2. **Split In Batches Node** - For each nearby hospital
3. **Phone/SMS Node** - Notify hospital emergency dept
4. **HTTP Request Node** - Update Chennai EMS

## 🔐 Security

### API Key Authentication
Include one of these headers in your requests:

```
X-API-Key: your-api-key
Authorization: Bearer your-api-key
X-N8N-Webhook-Auth: your-webhook-secret
```

### Rate Limiting
- Emergency webhooks: No limit (critical)
- Status checks: 60 requests/minute
- Updates: 30 requests/minute

## 🛠️ Testing

### Test Emergency Call
```bash
curl -X POST https://your-app.replit.app/webhook/n8n/emergency \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Anna Salai, Chennai",
    "latitude": 13.0605,
    "longitude": 80.2496,
    "emergency_type": "trauma",
    "priority": "critical"
  }'
```

### Test Hospital Status
```bash
curl https://your-app.replit.app/webhook/n8n/hospitals/status
```

## 📊 Real-time Updates

The system broadcasts real-time updates via WebSocket on `/ws`:

- `n8n_emergency_call` - New emergency from N8N
- `n8n_hospital_availability_update` - Hospital status changed
- `n8n_traffic_alert` - Traffic conditions updated
- `n8n_ambulance_dispatched` - Ambulance assigned

## 🚨 Emergency Response Flow

1. **Emergency Call** → Chennai EMS API
2. **Hospital Routing** → Find nearest available hospitals
3. **Dispatch Decision** → Select optimal hospital
4. **Ambulance Assignment** → Assign closest unit
5. **Real-time Tracking** → Monitor progress
6. **Status Updates** → Notify all stakeholders

## 📞 Support

For integration support, check the Chennai EMS dashboard system status and ensure all webhooks are properly configured with valid authentication.