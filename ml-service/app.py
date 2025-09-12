from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pickle
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import uvicorn
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Tourist Safety ML Service",
    description="Machine Learning service for predicting tourist safety risks and analyzing patterns",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class LocationData(BaseModel):
    latitude: float
    longitude: float
    timestamp: Optional[str] = None

class AlertData(BaseModel):
    tourist_id: int
    alert_type: str
    location: str
    latitude: float
    longitude: float
    description: Optional[str] = None
    timestamp: Optional[str] = None

class RiskPredictionRequest(BaseModel):
    location: LocationData
    tourist_data: Dict[str, Any]
    historical_alerts: Optional[List[AlertData]] = []
    time_of_day: Optional[int] = None  # Hour of day (0-23)
    day_of_week: Optional[int] = None  # Day of week (0-6)

class RiskPredictionResponse(BaseModel):
    risk_level: str  # low, medium, high, critical
    risk_score: float  # 0.0 to 1.0
    risk_factors: List[str]
    recommendations: List[str]
    confidence: float

class PatternAnalysisRequest(BaseModel):
    alerts: List[AlertData]
    time_range_days: Optional[int] = 30

class PatternAnalysisResponse(BaseModel):
    hotspots: List[Dict[str, Any]]
    time_patterns: Dict[str, Any]
    risk_trends: Dict[str, Any]
    insights: List[str]

# Global model storage
models = {}
risk_data = {}

# Load or initialize ML models
def load_models():
    """Load pre-trained models or initialize dummy models for demo"""
    global models, risk_data
    
    # Initialize dummy models for demo purposes
    models['risk_predictor'] = DummyRiskModel()
    logger.info("Initialized dummy risk prediction model")
    
    # Initialize risk data with some sample high-risk areas
    risk_data['high_risk_zones'] = [
        {'lat': 28.6139, 'lng': 77.2090, 'radius': 2, 'risk_factor': 0.8},  # Delhi
        {'lat': 19.0760, 'lng': 72.8777, 'radius': 2, 'risk_factor': 0.7},  # Mumbai
        {'lat': 12.9716, 'lng': 77.5946, 'radius': 2, 'risk_factor': 0.6},  # Bangalore
    ]
    
    risk_data['time_risk_factors'] = {
        'night_hours': [22, 23, 0, 1, 2, 3, 4, 5],  # Higher risk hours
        'weekend_multiplier': 1.2,
        'holiday_multiplier': 1.3
    }

class DummyRiskModel:
    """Dummy model for demonstration purposes"""
    
    def predict_risk(self, features):
        """Predict risk based on features"""
        # Simple rule-based risk calculation for demo
        base_risk = 0.2
        
        # Location-based risk
        lat, lng = features.get('latitude', 0), features.get('longitude', 0)
        location_risk = self._calculate_location_risk(lat, lng)
        
        # Time-based risk
        hour = features.get('hour', 12)
        time_risk = self._calculate_time_risk(hour)
        
        # Historical alert risk
        alert_count = features.get('recent_alerts', 0)
        alert_risk = min(alert_count * 0.1, 0.3)
        
        total_risk = min(base_risk + location_risk + time_risk + alert_risk, 1.0)
        return total_risk
    
    def _calculate_location_risk(self, lat, lng):
        """Calculate risk based on location proximity to high-risk zones"""
        max_risk = 0
        for zone in risk_data['high_risk_zones']:
            distance = ((lat - zone['lat']) ** 2 + (lng - zone['lng']) ** 2) ** 0.5
            if distance <= zone['radius']:
                max_risk = max(max_risk, zone['risk_factor'] * (1 - distance / zone['radius']))
        return max_risk * 0.5
    
    def _calculate_time_risk(self, hour):
        """Calculate risk based on time of day"""
        if hour in risk_data['time_risk_factors']['night_hours']:
            return 0.3
        return 0.1

@app.on_event("startup")
async def startup_event():
    """Initialize models on startup"""
    load_models()
    logger.info("ML Service started successfully")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Tourist Safety ML Service is running",
        "version": "1.0.0",
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "models_loaded": len(models),
        "timestamp": datetime.now().isoformat(),
        "service": "Tourist Safety ML"
    }

def _is_near_high_risk_zone(lat, lon, zone):
    """Check if location is near a high-risk zone"""
    # Simple distance calculation (in a real app, use proper geospatial libraries)
    distance = ((lat - zone['latitude']) ** 2 + (lon - zone['longitude']) ** 2) ** 0.5
    return distance < zone.get('radius', 0.01)  # Default 0.01 degree radius

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points using Haversine formula"""
    from math import radians, cos, sin, asin, sqrt
    
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 6371  # Radius of earth in kilometers
    return c * r

@app.post("/predict/risk", response_model=RiskPredictionResponse)
async def predict_risk(request: RiskPredictionRequest):
    """Predict safety risk for a given location and context"""
    try:
        # Prepare features for model
        current_time = datetime.now()
        hour = request.time_of_day or current_time.hour
        day_of_week = request.day_of_week or current_time.weekday()
        
        features = {
            'latitude': request.location.latitude,
            'longitude': request.location.longitude,
            'hour': hour,
            'day_of_week': day_of_week,
            'recent_alerts': len(request.historical_alerts)
        }
        
        # Get risk prediction
        risk_score = models['risk_predictor'].predict_risk(features)
        
        # Determine risk level
        if risk_score < 0.3:
            risk_level = "low"
        elif risk_score < 0.6:
            risk_level = "medium"
        elif risk_score < 0.8:
            risk_level = "high"
        else:
            risk_level = "critical"
        
        # Generate risk factors and recommendations
        risk_factors = []
        recommendations = []
        
        if hour in risk_data['time_risk_factors']['night_hours']:
            risk_factors.append("Late night/early morning hours")
            recommendations.append("Avoid traveling alone during night hours")
        
        if any(_is_near_high_risk_zone(request.location.latitude, request.location.longitude, zone) 
               for zone in risk_data['high_risk_zones']):
            risk_factors.append("Located in or near high-risk area")
            recommendations.append("Stay alert and consider alternative routes")
        
        if len(request.historical_alerts) > 2:
            risk_factors.append("Multiple recent alerts in the area")
            recommendations.append("Exercise extra caution and inform authorities of travel plans")
        
        if not risk_factors:
            risk_factors.append("Standard safety considerations")
            recommendations.append("Follow general safety guidelines")
        
        confidence = 0.85  # Dummy confidence score
        
        return RiskPredictionResponse(
            risk_level=risk_level,
            risk_score=risk_score,
            risk_factors=risk_factors,
            recommendations=recommendations,
            confidence=confidence
        )
        
    except Exception as e:
        logger.error(f"Error in risk prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error predicting risk: {str(e)}")

def _is_near_high_risk_zone(lat, lng, zone):
    """Check if location is near a high-risk zone"""
    distance = ((lat - zone['lat']) ** 2 + (lng - zone['lng']) ** 2) ** 0.5
    return distance <= zone['radius']

@app.post("/analyze/patterns", response_model=PatternAnalysisResponse)
async def analyze_patterns(request: PatternAnalysisRequest):
    """Analyze patterns in alert data to identify hotspots and trends"""
    try:
        alerts = request.alerts
        
        if not alerts:
            return PatternAnalysisResponse(
                hotspots=[],
                time_patterns={},
                risk_trends={},
                insights=["No alert data available for analysis"]
            )
        
        # Analyze hotspots (simplified clustering)
        hotspots = []
        location_clusters = {}
        
        for alert in alerts:
            # Simple grid-based clustering
            grid_lat = round(alert.latitude, 2)
            grid_lng = round(alert.longitude, 2)
            grid_key = f"{grid_lat},{grid_lng}"
            
            if grid_key not in location_clusters:
                location_clusters[grid_key] = {
                    'count': 0,
                    'alerts': [],
                    'center_lat': grid_lat,
                    'center_lng': grid_lng
                }
            
            location_clusters[grid_key]['count'] += 1
            location_clusters[grid_key]['alerts'].append(alert)
        
        # Convert to hotspots (areas with 2+ alerts)
        for cluster in location_clusters.values():
            if cluster['count'] >= 2:
                hotspots.append({
                    'location': {
                        'latitude': cluster['center_lat'],
                        'longitude': cluster['center_lng']
                    },
                    'alert_count': cluster['count'],
                    'severity': 'high' if cluster['count'] >= 5 else 'medium',
                    'alert_types': list(set(alert.alert_type for alert in cluster['alerts']))
                })
        
        # Analyze time patterns
        hour_counts = {}
        day_counts = {}
        
        for alert in alerts:
            try:
                if alert.timestamp:
                    dt = datetime.fromisoformat(alert.timestamp.replace('Z', '+00:00'))
                    hour = dt.hour
                    day = dt.weekday()
                    
                    hour_counts[hour] = hour_counts.get(hour, 0) + 1
                    day_counts[day] = day_counts.get(day, 0) + 1
            except:
                continue
        
        time_patterns = {
            'peak_hours': [hour for hour, count in sorted(hour_counts.items(), key=lambda x: x[1], reverse=True)[:3]],
            'peak_days': [day for day, count in sorted(day_counts.items(), key=lambda x: x[1], reverse=True)[:3]],
            'hourly_distribution': hour_counts,
            'daily_distribution': day_counts
        }
        
        # Analyze trends (simplified)
        alert_type_counts = {}
        for alert in alerts:
            alert_type_counts[alert.alert_type] = alert_type_counts.get(alert.alert_type, 0) + 1
        
        risk_trends = {
            'total_alerts': len(alerts),
            'alert_types': alert_type_counts,
            'trend_direction': 'stable',  # Simplified
            'risk_increase_areas': len(hotspots)
        }
        
        # Generate insights
        insights = []
        
        if hotspots:
            insights.append(f"Identified {len(hotspots)} high-alert areas requiring attention")
        
        if 'panic' in alert_type_counts and alert_type_counts['panic'] > len(alerts) * 0.3:
            insights.append("High proportion of panic alerts indicates potential security concerns")
        
        if time_patterns['peak_hours']:
            peak_hour = time_patterns['peak_hours'][0]
            insights.append(f"Peak alert time is {peak_hour}:00 - consider increased patrol during this hour")
        
        if not insights:
            insights.append("Alert patterns appear normal with no significant trends identified")
        
        return PatternAnalysisResponse(
            hotspots=hotspots,
            time_patterns=time_patterns,
            risk_trends=risk_trends,
            insights=insights
        )
        
    except Exception as e:
        logger.error(f"Error in pattern analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing patterns: {str(e)}")

@app.post("/train/model")
async def train_model(training_data: Dict[str, Any]):
    """Endpoint to retrain the model with new data"""
    try:
        # In a real implementation, this would retrain the model
        # For now, just acknowledge the request
        logger.info("Model training request received")
        
        return {
            "status": "success",
            "message": "Model training initiated",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in model training: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error training model: {str(e)}")

@app.get("/model/info")
async def model_info():
    """Get information about loaded models"""
    return {
        "models": list(models.keys()),
        "model_type": "Risk Prediction",
        "version": "1.0.0",
        "last_updated": datetime.now().isoformat(),
        "features": [
            "Risk level prediction",
            "Pattern analysis",
            "Hotspot identification",
            "Time-based risk assessment"
        ]
    }

if __name__ == "__main__":
    uvicorn.run(
        "app:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )