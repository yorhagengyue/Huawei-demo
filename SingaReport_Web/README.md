# SingaReport Web Application

SingaReport Web is a modern web application developed with Next.js 14, serving as the frontend user interface for the SingaReport smart city solution. This application enables citizens to report urban issues, track their resolution, and interact with real-time data about city infrastructure conditions.

## Features

### Core Functionality

- **Multi-step Issue Reporting**: Intuitive workflow for reporting urban problems
- **Interactive Map**: Visualize reported issues with marker clustering and animations
- **Real-time Updates**: View the latest reports without page refresh
- **User Dashboard**: Manage personal reports and track status changes
- **Authentication System**: Secure login and registration with JWT token
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices
- **Dark/Light Modes**: Support for user theme preferences

### Recent Improvements

- **Enhanced Navigation**: Added Home button in header and footer for easier site navigation
- **Improved Map Experience**: 
  - Map now centers on the most recent marker with smooth animation
  - Marker clustering for areas with multiple reports
  - Map visualization enlarged for better user experience
  - Hover tooltips on markers showing report details
- **Image Optimization**: External image support with proper domain configuration
- **Unified Category System**: Standardized categories across report creation and overview pages
- **Language Improvements**: Complete translation of interface elements and comments to English
- **Enhanced Authentication Handling**: Improved middleware for proper authentication of API requests

### Data Flow and Synchronization

- **Instant Feedback**: Reports appear on the Dashboard immediately after submission, no refresh needed
- **Temporary Storage**: Browser local storage saves newly submitted reports, ensuring visibility even offline
- **Automatic Refresh**: Dashboard automatically fetches new data every 30 seconds
- **Manual Refresh**: Users can click the refresh button to get the latest data anytime

### Data Source Indicators

- **Visual Indicators**: Clearly show current data source (database or demo data)
- **Timestamps**: Display last update time, helping users understand data freshness
- **Status Differentiation**: Different colors and icons for different data sources, improving recognizability

### Development and Deployment Environment Support

- **Demo Mode**: Control demo mode through `NEXT_PUBLIC_DEMO_MODE` environment variable
- **Smooth Fallback**: Development environment automatically falls back to demo data when database connection fails
- **Error Handling**: Comprehensive error handling and status feedback

## Project Structure

```
SingaReport_Web/
├── src/                    # Source code directory
│   ├── app/                # Next.js application pages
│   │   ├── (auth)/         # Authentication routes
│   │   ├── (dashboard)/    # User dashboard routes
│   │   ├── (public)/       # Public pages
│   │   ├── api/            # API routes
│   │   ├── help/           # Help pages
│   │   ├── page.tsx        # Landing page
│   │   └── layout.tsx      # Root layout
│   ├── components/         # Reusable components
│   │   ├── common/         # Common UI components
│   │   ├── maps/           # Map related components
│   │   ├── reports/        # Report related components
│   │   ├── files/          # File handling components
│   │   └── ui/             # Base UI components
│   ├── contexts/           # React contexts
│   ├── lib/                # Utility functions and libraries
│   ├── scripts/            # Helper scripts
│   └── types/              # TypeScript type definitions
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
├── .env                    # Environment configuration
├── next.config.js          # Next.js configuration
└── package.json            # npm dependencies
```

## Key Components

### Map Visualization

The map visualization system uses Google Maps JavaScript API with custom components:

- **MapContainer**: Main container for Google Maps with animation support
- **MapMarker**: Custom markers showing reported issues
- **MarkerClusterer**: Groups multiple markers in close proximity
- **CurrentLocationButton**: Allows users to center map on their location

### Reporting System

The reporting system is built with a multi-step workflow:

1. **Location Selection**: Find and mark issue location on map
2. **Category Selection**: Choose from predefined issue categories
3. **Details Entry**: Add description, photos, and severity level
4. **Review and Submit**: Confirm details before submission

### Dashboard Interface

The dashboard provides real-time data visualization:

- **Statistics Summary**: Overview of reports by status and category
- **Report List**: Filterable list of submitted reports
- **Map View**: Geographic visualization of reports
- **View Toggle**: Switch between list and map views

## Technologies Used

- **Frontend Framework**: Next.js 14
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **State Management**: React Context API, Zustand
- **Maps**: Google Maps JavaScript API
- **Database ORM**: Prisma
- **Authentication**: JWT Tokens
- **API**: RESTful API endpoints

## Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- PostgreSQL (for production use)

### Setup Steps

1. Clone the repository:
```bash
git clone https://github.com/your-organization/SingaReport_Web.git
cd SingaReport_Web
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
```

Edit the `.env.local` file with your configuration:
```
DATABASE_URL="postgresql://username:password@localhost:5432/singareport?schema=public"
JWT_SECRET="your_jwt_secret_key"
NEXT_PUBLIC_DEMO_MODE="true"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
```

4. Run database migrations (if using PostgreSQL):
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
# or
yarn dev
```

6. Open your browser and visit:
```
http://localhost:3000
```

## Development Mode

The application supports a demo mode for development, using mock data when the database is unavailable:

1. Set the environment variable:
```
NEXT_PUBLIC_DEMO_MODE="true"
```

2. The application will automatically show demo data:
   - Demo reports will be clearly marked
   - All functionality works with demo data
   - Updates can be tested without database connection

## API Endpoints

The web application exposes the following API endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Token verification

### Reports
- `GET /api/reports` - List reports (with optional filters)
- `POST /api/reports` - Create new report
- `GET /api/reports/[id]` - Get report details
- `PUT /api/reports/[id]` - Update report
- `DELETE /api/reports/[id]` - Delete report

### Files
- `GET /api/files/list` - List user files
- `GET /api/files/[fileId]` - Get file details
- `GET /api/files/[fileId]/download` - Download file
- `POST /api/upload` - Upload files

## Integration with Janus AI

The web application integrates with the Janus-Pro-7B multimodal model for intelligent image analysis:

- **Image Upload**: When users upload images, they are processed by the Janus AI model
- **Automatic Classification**: The model suggests categories and severity levels based on image content
- **Road Issue Detection**: Specialized recognition of Singapore road conditions
- **Form Prefilling**: AI suggestions are used to prefill report details

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is part of the SingaReport smart city solution and is provided as original content. 