# Changelog

All notable changes to the Chennai Emergency Ambulance Routing System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of Chennai Emergency Ambulance Routing System
- Real-time emergency dispatch dashboard
- Interactive map with Chennai hospital locations
- WebSocket integration for live updates
- Traffic-aware routing algorithm
- N8N integration for automated workflows
- Professional dark theme UI optimized for emergency operations

### Features
- **Hospital Database**: 8 major Chennai hospitals with real data
- **Emergency Management**: Create and track emergency calls
- **Ambulance Tracking**: Real-time ambulance location updates
- **Traffic Intelligence**: Dynamic congestion zones and time-based multipliers
- **GPS Integration**: Automatic location detection
- **Hospital Ranking**: Intelligent hospital selection based on ETA and capacity
- **System Metrics**: Real-time system status and performance indicators

## [1.0.0] - 2024-12-30

### Added
- **Core Emergency Dispatch System**
  - Emergency call creation and management
  - Hospital availability tracking
  - Ambulance assignment and tracking
  - Real-time status updates via WebSocket

- **Interactive Mapping**
  - Leaflet.js integration with Chennai map
  - Hospital markers with detailed information
  - Route visualization between emergency location and hospitals
  - Traffic zone overlays

- **Hospital Database**
  - Apollo Hospital Greams Road
  - Fortis Malar Hospital
  - Stanley Medical College Hospital
  - Vijaya Hospital Vadapalani
  - Gleneagles Global Hospital
  - SRM Medical College Hospital
  - MIOT International
  - Omandurar Government Multi Super Speciality Hospital

- **Traffic Intelligence**
  - T. Nagar Commercial Area (1.5x multiplier)
  - Anna Salai Corridor (1.3x multiplier)
  - Vadapalani Junction (1.2x multiplier)
  - Guindy Industrial Area (1.4x multiplier)
  - Porur IT Corridor (1.3x multiplier)
  - Time-based traffic patterns (rush hours, weekends)

- **API Endpoints**
  - `POST /api/emergency` - Create emergency call
  - `GET /api/hospitals/nearest` - Find nearest hospitals
  - `GET /api/system/status` - Get system metrics
  - `PATCH /api/hospitals/:id/availability` - Update hospital availability
  - `WS /ws` - Real-time WebSocket updates

- **N8N Integration**
  - Emergency dispatch webhook
  - Hospital status monitoring
  - Traffic alert system
  - Automated workflow support

### Technical Features
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript + WebSocket
- **Database**: In-memory storage with PostgreSQL schema
- **Maps**: Leaflet.js with OpenStreetMap tiles
- **Real-time**: WebSocket for live updates
- **Validation**: Zod schema validation
- **UI Components**: Radix UI with custom styling

### Security
- API key authentication for N8N integration
- Input validation and sanitization
- Error handling and logging
- Secure WebSocket connections

### Performance
- Optimized hospital ranking algorithm
- Efficient distance calculations using Haversine formula
- Real-time data refresh (30s for hospitals, 10s for system status)
- Responsive design for mobile emergency use

---

## Version History

- **1.0.0**: Initial release with full emergency dispatch capabilities
- **Unreleased**: Future features and improvements

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
