# Smart Crop Advisor

A full-stack ML application that provides AI-powered crop recommendations based on soil conditions, weather data, and market prices.

## Features

- **Smart Recommendations**: Get top 3 crop recommendations with yield predictions and profit estimates
- **Soil Auto-fill**: Automatic soil property estimation based on soil type selection
- **Real-time Data**: Integration with weather and market price APIs
- **Sustainability Scoring**: Environmental impact assessment for each crop recommendation
- **History Tracking**: Save and review past recommendations
- **Mobile-first Design**: Responsive UI optimized for mobile devices

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Encore.ts (TypeScript) with PostgreSQL
- **ML Service**: Python + FastAPI + scikit-learn
- **ML Model**: Random Forest Classifier for crop recommendation

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- Docker & Docker Compose
- Encore CLI

### Running with Docker (Recommended)

1. Clone the repository
2. Start the services:
   ```bash
   docker-compose up --build
   ```
3. The ML service will automatically train the model on startup
4. Access the application:
   - Backend: http://localhost:4000
   - ML Service: http://localhost:8001
   - Frontend: Will be served by Encore

### Running Locally

1. **Start ML Service**:
   ```bash
   cd ml-service
   pip install -r requirements.txt
   python train.py  # Train the model
   python app.py    # Start the service
   ```

2. **Start Backend**:
   ```bash
   encore run
   ```

3. **The frontend will be automatically served by Encore**

### Environment Variables

Create a `.env` file or set these environment variables:

- `WeatherAPIKey`: Your OpenWeatherMap API key

## API Documentation

### Backend Endpoints

- `POST /api/recommend` - Get crop recommendations
- `GET /api/history/:userId` - Get user recommendation history  
- `POST /api/feedback` - Submit feedback on recommendations

### ML Service Endpoints

- `POST /predict` - Get crop predictions
- `GET /health` - Health check

## Model Details

The ML model uses a Random Forest Classifier trained on synthetic agricultural data with the following features:

- **Soil Properties**: N, P, K, pH, moisture, soil type
- **Weather**: Temperature, humidity, rainfall
- **Farm Details**: Area in hectares

The model provides:
- Top 3 crop recommendations with confidence scores
- Yield predictions (kg/hectare)
- Profit estimates based on current market prices
- Sustainability scores

## Soil Type Auto-fill

The application automatically fills soil properties based on selected soil type:

- Sandy: Low nutrients, good drainage
- Loamy: Balanced nutrients, optimal for most crops
- Clayey: High nutrients, water retention
- Black: High fertility, cotton-suitable
- Red: Moderate fertility, well-drained
- Alluvial: High fertility, river deposits

## Development

### Training a New Model

```bash
cd ml-service
python train.py
```

This will:
1. Generate synthetic training data
2. Train a Random Forest model
3. Save model artifacts to `models/` directory
4. Display training metrics and evaluation results

### Running Tests

```bash
# Backend tests
encore test

# ML service tests
cd ml-service
pytest
```

## Production Deployment

1. **Set Environment Variables**:
   - Database connection strings
   - API keys for weather and market data
   - ML service URL

2. **Deploy Services**:
   - Use Encore's deployment for the backend
   - Deploy ML service to cloud container service
   - Ensure services can communicate

3. **Model Updates**:
   - Implement automated retraining pipeline
   - Version control for model artifacts
   - A/B testing for model improvements

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details
