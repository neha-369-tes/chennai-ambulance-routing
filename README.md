##AMBUCLEAR 
# 🚑 Indian Emergency Ambulance Routing System

A professional, real-time emergency dispatch system designed specifically for Chennai, featuring intelligent hospital routing, traffic-aware navigation, and comprehensive emergency management capabilities.

![Chennai EMS Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

## ✨ Features

### 🏥 **Real Chennai Hospital Database**
- **8 Major Hospitals**: Apollo, Fortis, Stanley Medical, Vijaya, Gleneagles, SRM, MIOT, Omandurar
- **Detailed Profiles**: Location, specialties, emergency levels, capacity, cost
- **Smart Filtering**: Trauma centers, medical facilities, government vs private

### 🗺️ **Interactive Mapping & Routing**
- **Real-time Map**: Leaflet.js with Chennai hospital markers
- **Route Visualization**: Hospital-to-emergency routes with traffic data
- **Traffic Zones**: 5 major congestion areas (T.Nagar, Anna Salai, Vadapalani, Guindy, Porur)
- **GPS Integration**: Automatic location detection and coordinate parsing

### ⚡ **Real-time Emergency Dispatch**
- **Professional Dashboard**: Dark theme optimized for emergency operations
- **Emergency Details Form**: Location, type (medical/trauma), priority levels
- **Live Status Updates**: Hospital availability, ambulance tracking, system metrics
- **Intelligent Ranking**: Hospitals ranked by ETA, capacity, and emergency type suitability

### 🔄 **WebSocket Integration**
- **Live Updates**: Hospital status, ambulance locations, emergency calls
- **Auto-refresh**: Hospital data every 30s, system status every 10s
- **Real-time Notifications**: Toast alerts for system events
- **Connection Management**: Automatic reconnection handling

### 🚗 **Traffic Intelligence**
- **Dynamic Traffic Patterns**: Time-based congestion multipliers (rush hours, weekends)
- **Distance Calculation**: Haversine formula for accurate routing
- **ETA Estimation**: Traffic-aware travel time calculations
- **Hospital Suitability**: Emergency type matching with hospital capabilities

### 🔧 **System Management**
- **Hospital Availability**: Real-time status updates
- **Ambulance Tracking**: 8 ambulances with location tracking
- **Emergency Call Management**: Create, update, and track emergency calls
- **System Metrics**: Response times, availability percentages

### 🔌 **N8N Integration**
- **Webhook Endpoints**: Emergency dispatch, hospital status, traffic alerts
- **Automated Workflows**: External system integration capabilities
- **API Authentication**: Secure key-based access
- **External System Support**: Third-party emergency system integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/chennai-ambulance-routing.git
cd chennai-ambulance-routing
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to `http://localhost:3000` to access the emergency dispatch dashboard.

## 📁 Project Structure

```
chennai-ambulance-routing/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and configurations
│   │   └── hooks/          # Custom React hooks
├── server/                 # Express.js backend
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data storage layer
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and schemas
├── data/                   # Hospital database
├── n8n-integration/        # N8N workflow integration
└── package.json            # Project dependencies
```

## 🏥 Hospital Database

The system includes 8 major Chennai hospitals with real data:

| Hospital | Type | Emergency Level | Capacity | Cost |
|----------|------|----------------|----------|------|
| Apollo Hospital Greams Road | Multi-specialty | Level 1 Trauma | High | Expensive |
| Fortis Malar Hospital | Multi-specialty | Level 1 Trauma | High | Expensive |
| Stanley Medical College Hospital | Government | Level 1 Trauma | Very High | Free |
| Vijaya Hospital Vadapalani | Multi-specialty | Level 2 | Medium | Moderate |
| Gleneagles Global Hospital | Multi-specialty | Level 1 Trauma | High | Expensive |
| SRM Medical College Hospital | Medical College | Level 1 Trauma | High | Moderate |
| MIOT International | Multi-specialty | Level 1 Trauma | High | Expensive |
| Omandurar Government Hospital | Government | Level 1 Trauma | Very High | Free |

## 🗺️ Traffic Zones

The system includes 5 major Chennai traffic congestion zones:

1. **T. Nagar Commercial Area** - High congestion (1.5x multiplier)
2. **Anna Salai Corridor** - Moderate congestion (1.3x multiplier)
3. **Vadapalani Junction** - Light congestion (1.2x multiplier)
4. **Guindy Industrial Area** - High congestion (1.4x multiplier)
5. **Porur IT Corridor** - Moderate congestion (1.3x multiplier)

## 🔌 API Endpoints

### Emergency Management
- `POST /api/emergency` - Create emergency call
- `GET /api/emergency/:id` - Get emergency call details
- `PATCH /api/emergency/:id` - Update emergency call

### Hospital Management
- `GET /api/hospitals` - Get all hospitals
- `GET /api/hospitals/nearest` - Find nearest hospitals
- `PATCH /api/hospitals/:id/availability` - Update hospital availability

### System Status
- `GET /api/system/status` - Get system metrics
- `GET /api/ambulances` - Get ambulance status

### WebSocket
- `WS /ws` - Real-time updates

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# N8N Integration
N8N_API_KEY=your-secure-api-key-here
N8N_WEBHOOK_SECRET=your-webhook-secret-here

# Database (if using external database)
DATABASE_URL=your-database-url
```

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```bash
docker build -t chennai-ambulance-routing .
docker run -p 3000:3000 chennai-ambulance-routing
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Chennai Hospitals**: Real hospital data and locations
- **OpenStreetMap**: Map tiles and geographic data
- **Leaflet.js**: Interactive mapping library
- **React Community**: UI framework and ecosystem


---

**⚠️ Important**: This system is designed for emergency medical dispatch. Always verify hospital availability and contact emergency services directly for critical situations.

**Made with ❤️ for Chennai Emergency Services**
