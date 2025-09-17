# Smart Crop Advisor

AI-powered crop recommendation system that provides farmers with data-driven insights for optimal crop selection based on soil conditions, weather patterns, and market prices.

## Features

- **Smart Crop Recommendations**: ML-powered suggestions with yield predictions and profit estimates
- **Real-time Weather Integration**: Live weather data and seasonal forecasts from OpenWeatherMap
- **Soil Analysis**: SoilGrids API integration for location-specific soil data
- **Market Price Integration**: Regional market prices and trends for better decision making
- **Sustainability Scoring**: Environmental impact assessment for farming practices
- **Multi-language Support**: Available in English and Hindi
- **Historical Tracking**: Save and review past recommendations

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS v4** for styling
- **shadcn/ui** components
- **React Router** for navigation
- **TanStack React Query** for data fetching

### Backend
- **Encore.ts** framework
- **PostgreSQL** database
- **REST APIs** for data integration
- **TypeScript** throughout

### Machine Learning
- **Python 3.9+**
- **FastAPI** for ML service
- **scikit-learn** for model training
- **pandas** and **numpy** for data processing

### External APIs
- **OpenWeatherMap API** for weather data
- **SoilGrids API** for soil information
- **Market Price APIs** for commodity pricing

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** and **npm**
- **Python 3.9+** and **pip**
- **Docker** and **Docker Compose** (for ML service)
- **PostgreSQL 14+** (if running without Docker)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd smart-crop-advisor
```

### 2. Environment Setup

Create environment files for configuration:

```bash
# Backend environment (create .env in project root)
cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/crop_advisor

# External API Keys
OPENWEATHER_API_KEY=your_openweathermap_api_key
AGMARKNET_API_KEY=your_agmarknet_api_key_optional

# Environment
NODE_ENV=development
PORT=4000
EOF
```

### 3. Database Setup

#### Using Docker (Recommended)
```bash
# Start PostgreSQL with Docker
docker run --name crop-advisor-db \
  -e POSTGRES_DB=crop_advisor \
  -e POSTGRES_USER=username \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:14

# Wait for database to be ready
sleep 10
```

#### Manual PostgreSQL Setup
```bash
# Create database
createdb crop_advisor

# Create user (optional)
psql -c "CREATE USER username WITH PASSWORD 'password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE crop_advisor TO username;"
```

### 4. Backend Setup

```bash
# Install dependencies
npm install

# Run database migrations
npx encore db migrate

# Start the backend server
npm run dev
```

The backend will be available at `http://localhost:4000`

### 5. ML Service Setup

```bash
# Navigate to ML service directory
cd ml-service

# Method 1: Using Docker (Recommended)
docker build -t crop-ml-service .
docker run -p 8001:8001 crop-ml-service

# Method 2: Using Python directly
pip install -r requirements.txt
python app.py
```

The ML service will be available at `http://localhost:8001`

### 6. Frontend Setup

```bash
# Install frontend dependencies
cd frontend
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 7. Full Stack with Docker Compose

For a complete setup with all services:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## API Keys Required

### OpenWeatherMap API (Required)
1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your free API key
3. Add it to your `.env` file as `OPENWEATHER_API_KEY`

### AgMarkNet API (Optional)
1. Register at [data.gov.in](https://data.gov.in/)
2. Subscribe to AgMarkNet APIs
3. Add key to `.env` file as `AGMARKNET_API_KEY`

## Development

### Running in Development Mode

```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: ML Service
cd ml-service && python app.py

# Terminal 3: Frontend
cd frontend && npm run dev
```

### Database Migrations

```bash
# Create a new migration
npx encore db migration create <migration_name>

# Apply migrations
npx encore db migrate

# Reset database (development only)
npx encore db reset
```

### Testing

```bash
# Run backend tests
npm test

# Run frontend tests
cd frontend && npm test

# Run ML service tests
cd ml-service && python -m pytest
```

## Production Deployment

### Using Encore Cloud (Recommended)

```bash
# Deploy to Encore Cloud
npx encore app create
npx encore deploy

# Set environment variables
npx encore secrets set --type dev OPENWEATHER_API_KEY=your_key
npx encore secrets set --type prod OPENWEATHER_API_KEY=your_key
```

### Manual Deployment

#### Backend
```bash
# Build the backend
npm run build

# Start production server
npm start
```

#### Frontend
```bash
# Build the frontend
cd frontend && npm run build

# Serve static files (using nginx, Apache, or similar)
```

#### ML Service
```bash
# Build and deploy ML service
docker build -t crop-ml-service .
docker run -d -p 8001:8001 crop-ml-service
```

## Project Structure

```
smart-crop-advisor/
├── backend/                 # Encore.ts backend
│   └── main/
│       ├── encore.service.ts
│       ├── recommend.ts     # Main recommendation API
│       ├── soil_api.ts      # Soil data integration
│       ├── weather_api.ts   # Weather APIs
│       ├── market_api.ts    # Market price APIs
│       ├── history.ts       # Recommendation history
│       └── migrations/      # Database migrations
├── frontend/                # React frontend
│   ├── src/
│   ├── pages/              # Page components
│   ├── components/         # Reusable components
│   ├── context/           # React contexts (language, etc.)
│   └── utils/             # Utility functions
├── ml-service/             # Python ML microservice
│   ├── app.py             # FastAPI application
│   ├── train.py           # Model training scripts
│   ├── models/            # Trained ML models
│   └── requirements.txt   # Python dependencies
├── docker-compose.yml     # Multi-service setup
└── README.md             # This file
```

## API Endpoints

### Main Recommendation API
- `POST /api/recommend` - Get crop recommendations

### Weather APIs
- `GET /india/weather` - Weather by Indian city
- `GET /global/weather` - Weather by coordinates
- `GET /global/current` - Current weather only
- `GET /global/forecast` - Weather forecast

### Soil APIs
- `GET /api/soil/properties` - Soil properties by coordinates

### Market APIs
- `GET /api/market/prices` - Current market prices
- `GET /api/market/data` - Comprehensive market data
- `GET /api/market/nearby` - Find nearby markets

### History APIs
- `GET /api/history` - Get recommendation history
- `POST /api/history` - Save recommendation

## Troubleshooting

### Common Issues

#### Backend not starting
```bash
# Check if database is running
pg_isready -h localhost -p 5432

# Check environment variables
cat .env

# View logs
npm run dev --verbose
```

#### ML Service connection errors
```bash
# Check if ML service is running
curl http://localhost:8001/health

# Restart ML service
cd ml-service && python app.py
```

#### Frontend API errors
```bash
# Check if backend is accessible
curl http://localhost:4000/api/health

# Check browser console for detailed errors
```

#### Database connection issues
```bash
# Test database connection
psql postgresql://username:password@localhost:5432/crop_advisor

# Reset database if needed
npx encore db reset
npx encore db migrate
```

### Performance Optimization

#### ML Service
- Models are loaded at startup for better performance
- Consider using Redis for caching predictions
- Scale horizontally for high load

#### Database
- Add indexes for frequently queried fields
- Use connection pooling for production
- Monitor query performance

#### Frontend
- Uses React Query for efficient data fetching
- Implements lazy loading for better performance
- Optimizes bundle size with code splitting

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all services start without errors

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review API documentation in the code

## Acknowledgments

- OpenWeatherMap for weather data
- SoilGrids for soil information
- Government of India for market price data sources
- Encore.ts team for the excellent backend framework
- All contributors to open-source libraries used in this project