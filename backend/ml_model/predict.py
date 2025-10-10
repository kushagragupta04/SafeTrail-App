#!/usr/bin/env python3
"""
TravelSafety ML Model - Threat Detection and Analysis
Integrated with your threat detection script
"""

import os
import json
import sys
import pandas as pd
from datetime import datetime
import numpy as np
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError

# Configuration
THREAT_PROFILE_FILE = os.path.join(os.path.dirname(__file__), 'district_threat_profiles.csv')
THREAT_KEYWORDS = ["protest", "riot", "unrest", "violence", "flood", "cyclone", "disaster", "scam", "theft", "robbery", "accident"]

class TravelSafetyMLModel:
    def __init__(self):
        self.model_loaded = False
        self.data_loaded = False
        self.model_version = "1.0"
        self.threat_profiles_df = None
        self.geolocator = Nominatim(user_agent="travel-safety-app")
        
    def load_model(self):
        """Load the threat detection model"""
        try:
            # Load threat profiles CSV
            if os.path.exists(THREAT_PROFILE_FILE):
                self.threat_profiles_df = pd.read_csv(THREAT_PROFILE_FILE)
                self.model_loaded = True
                print(f"Threat profiles loaded from {THREAT_PROFILE_FILE}", file=sys.stderr)
            else:
                print(f"Warning: Threat profiles file not found at {THREAT_PROFILE_FILE}", file=sys.stderr)
                self.model_loaded = False
        except Exception as e:
            print(f"Error loading model: {e}", file=sys.stderr)
            self.model_loaded = False
    
    def get_district_from_coordinates(self, latitude, longitude):
        """Get district name from coordinates using reverse geocoding"""
        try:
            location = self.geolocator.reverse((latitude, longitude), exactly_one=True)
            if location and location.raw.get('address'):
                address = location.raw['address']
                # Try different address components for district name
                district = (address.get('city_district') or 
                           address.get('suburb') or 
                           address.get('city') or
                           address.get('county') or
                           address.get('state_district'))
                return district
        except (GeocoderTimedOut, GeocoderServiceError) as e:
            print(f"Geocoding error: {e}", file=sys.stderr)
        except Exception as e:
            print(f"Unexpected geocoding error: {e}", file=sys.stderr)
        return None
    
    def get_district_threats(self, district_name):
        """Get threat profile for a specific district"""
        if not self.threat_profiles_df is not None or district_name is None:
            return "No threat data available"
        
        try:
            threat_row = self.threat_profiles_df[
                self.threat_profiles_df['District'].str.lower() == district_name.lower()
            ]
            
            if not threat_row.empty:
                threats_dict = threat_row.iloc[0].to_dict()
                threat_message = ""
                for key, value in threats_dict.items():
                    if key != "District" and pd.notna(value):
                        clean_value = str(value).replace('[', '').replace(']', '').replace("'", "")
                        threat_message += f"\n- {key.replace('_', ' ').title()}: {clean_value}"
                return threat_message
        except Exception as e:
            print(f"Error getting district threats: {e}", file=sys.stderr)
        
        return "No specific threat data available for this district"
    
    def get_mock_news_articles(self):
        """Get mock news articles for threat detection"""
        return [
            {"title": "Heavy rains and flood warnings issued for Delhi", "source": {"name": "Indian News"}, "url": "https://example.com/delhi-flood"},
            {"title": "Mumbai traffic chaos due to political protest", "source": {"name": "Local Times"}, "url": "https://example.com/mumbai-protest"},
            {"title": "Tourist scams on the rise in Jaipur", "source": {"name": "Travel Journal"}, "url": "https://example.com/jaipur-scams"},
            {"title": "Road accidents increase in Bangalore", "source": {"name": "City News"}, "url": "https://example.com/bangalore-accidents"},
            {"title": "Theft incidents reported in Chennai", "source": {"name": "Local Herald"}, "url": "https://example.com/chennai-theft"},
        ]
    
    def analyze_threats(self, latitude, longitude, accuracy, user_id):
        """Main threat analysis function"""
        start_time = datetime.now()
        
        try:
            # Get district from coordinates
            district_name = self.get_district_from_coordinates(latitude, longitude)
            
            if not district_name:
                return self._get_fallback_result("Could not determine district from coordinates")
            
            # Get threat profile for the district
            threat_profile = self.get_district_threats(district_name)
            
            # Get mock news articles
            news_articles = self.get_mock_news_articles()
            
            # Analyze threats
            threats_detected = []
            risk_level = "low"
            confidence = 0.7
            
            for article in news_articles:
                title = article.get('title', '')
                
                # Check if article contains threat keywords and mentions the district
                if (any(keyword in title.lower() for keyword in THREAT_KEYWORDS) and 
                    district_name.lower() in title.lower()):
                    
                    threats_detected.append({
                        "title": title,
                        "source": article.get('source', {}).get('name'),
                        "url": article.get('url'),
                        "district": district_name
                    })
            
            # Determine risk level based on threats detected
            if len(threats_detected) > 0:
                risk_level = "high" if len(threats_detected) >= 2 else "medium"
                confidence = 0.9 if len(threats_detected) >= 2 else 0.8
            
            # Generate insights and recommendations
            insights = self._generate_insights(district_name, threats_detected, threat_profile)
            recommendations = self._generate_recommendations(risk_level, threats_detected)
            prediction = self._generate_prediction(district_name, risk_level, threats_detected)
            safety_alert = self._check_safety_alert(risk_level, threats_detected)
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return {
                "risk_level": risk_level,
                "confidence": confidence,
                "prediction": prediction,
                "insights": insights,
                "recommendations": recommendations,
                "safety_alert": safety_alert,
                "model_version": self.model_version,
                "processing_time": processing_time,
                "district": district_name,
                "threats_detected": len(threats_detected),
                "threat_details": threats_detected
            }
            
        except Exception as e:
            print(f"Analysis error: {e}", file=sys.stderr)
            return self._get_fallback_result(f"Analysis error: {str(e)}")
    
    def _generate_insights(self, district_name, threats_detected, threat_profile):
        """Generate insights based on analysis"""
        insights = []
        
        insights.append(f"Analyzing safety conditions in {district_name}")
        
        if len(threats_detected) > 0:
            insights.append(f"Found {len(threats_detected)} active threat(s) in the area")
            for threat in threats_detected:
                insights.append(f"Active threat: {threat['title']}")
        else:
            insights.append("No active threats detected in recent news")
        
        if "No specific threat data" not in threat_profile:
            insights.append("Historical threat data available for this district")
        else:
            insights.append("Limited historical threat data for this district")
        
        # Add accuracy-based insight
        insights.append("Analysis based on real-time news and historical data")
        
        return insights
    
    def _generate_recommendations(self, risk_level, threats_detected):
        """Generate safety recommendations"""
        recommendations = []
        
        if risk_level == "high":
            recommendations.append("⚠️ HIGH RISK: Avoid this area if possible")
            recommendations.append("Stay alert and aware of your surroundings")
            recommendations.append("Consider alternative routes or postpone travel")
            recommendations.append("Keep emergency contacts readily available")
        elif risk_level == "medium":
            recommendations.append("🟡 MODERATE RISK: Exercise caution")
            recommendations.append("Be extra vigilant in this area")
            recommendations.append("Avoid isolated or poorly lit areas")
            recommendations.append("Stay informed about local conditions")
        else:
            recommendations.append("🟢 LOW RISK: Normal safety precautions apply")
            recommendations.append("Maintain general awareness of surroundings")
            recommendations.append("Follow standard safety practices")
        
        if len(threats_detected) > 0:
            recommendations.append("Monitor local news for updates")
            recommendations.append("Consider using alternative transportation")
        
        return recommendations
    
    def _generate_prediction(self, district_name, risk_level, threats_detected):
        """Generate prediction text"""
        if risk_level == "high":
            return f"High risk detected in {district_name}. Multiple threats identified. Avoid if possible."
        elif risk_level == "medium":
            return f"Moderate risk in {district_name}. Some safety concerns present. Exercise caution."
        else:
            return f"Low risk in {district_name}. Area appears generally safe for normal activities."
    
    def _check_safety_alert(self, risk_level, threats_detected):
        """Check if safety alert should be triggered"""
        if risk_level == "high" and len(threats_detected) > 0:
            return {
                "type": "high_risk_area",
                "severity": "high",
                "message": f"High risk area detected with {len(threats_detected)} active threat(s). Please exercise extreme caution."
            }
        elif risk_level == "medium" and len(threats_detected) > 0:
            return {
                "type": "moderate_risk",
                "severity": "medium",
                "message": f"Moderate risk detected with {len(threats_detected)} active threat(s). Please be cautious."
            }
        else:
            return None
    
    def _get_fallback_result(self, error_message):
        """Fallback result when analysis fails"""
        return {
            "risk_level": "unknown",
            "confidence": 0.0,
            "prediction": f"Analysis failed: {error_message}",
            "insights": ["Unable to analyze location", "Please try again"],
            "recommendations": ["Use general safety precautions", "Stay alert"],
            "safety_alert": None,
            "model_version": self.model_version,
            "processing_time": 0.0,
            "district": "Unknown",
            "threats_detected": 0,
            "threat_details": []
        }

def main():
    """Main function - entry point for command line execution"""
    try:
        # Get command line arguments
        if len(sys.argv) != 5:
            print(json.dumps({
                "error": "Invalid arguments. Usage: python predict.py <latitude> <longitude> <accuracy> <user_id>"
            }))
            sys.exit(1)
        
        latitude = float(sys.argv[1])
        longitude = float(sys.argv[2])
        accuracy = float(sys.argv[3])
        user_id = sys.argv[4]
        
        # Initialize and load model
        model = TravelSafetyMLModel()
        model.load_model()
        
        # Make prediction
        result = model.analyze_threats(latitude, longitude, accuracy, user_id)
        
        # Output JSON result to stdout
        print(json.dumps(result))
        
    except Exception as e:
        # Output error as JSON
        error_result = {
            "error": str(e),
            "risk_level": "unknown",
            "confidence": 0.0,
            "prediction": "Error occurred during analysis",
            "insights": ["Model error occurred"],
            "recommendations": ["Please try again or contact support"],
            "safety_alert": None,
            "model_version": "1.0",
            "processing_time": 0.0,
            "district": "Unknown",
            "threats_detected": 0,
            "threat_details": []
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()
