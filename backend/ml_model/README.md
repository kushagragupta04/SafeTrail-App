# Python ML Model Integration

This directory contains the Python ML model integration for the TravelSafety app.

## Setup Instructions

### 1. Create Python Environment
```bash
cd backend/ml_model
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. File Structure
```
backend/ml_model/
├── predict.py          # Your main ML prediction script
├── data.csv            # Your training/prediction data
├── requirements.txt    # Python dependencies
├── ml_service.py       # Flask API service (optional)
└── README.md          # This file
```

### 3. Required Python Script Format

Your `predict.py` script should accept command line arguments and output JSON:

```python
import sys
import json
import pandas as pd
from your_ml_model import YourModel

def main():
    # Get command line arguments
    latitude = float(sys.argv[1])
    longitude = float(sys.argv[2])
    accuracy = float(sys.argv[3])
    user_id = sys.argv[4]
    
    # Load your model and CSV data
    model = YourModel()
    data = pd.read_csv('data.csv')
    
    # Make prediction
    prediction = model.predict(latitude, longitude, accuracy, data)
    
    # Output JSON result
    result = {
        "risk_level": prediction.risk_level,
        "confidence": prediction.confidence,
        "prediction": prediction.result,
        "insights": prediction.insights,
        "recommendations": prediction.recommendations,
        "safety_alert": prediction.safety_alert,
        "model_version": "1.0"
    }
    
    print(json.dumps(result))

if __name__ == "__main__":
    main()
```

### 4. Optional Flask API Service

Create `ml_service.py` for HTTP API communication:

```python
from flask import Flask, request, jsonify
import pandas as pd
from your_ml_model import YourModel

app = Flask(__name__)
model = YourModel()
data = pd.read_csv('data.csv')

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "model": "loaded"})

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        payload = request.json
        latitude = payload['latitude']
        longitude = payload['longitude']
        accuracy = payload['accuracy']
        user_id = payload['userId']
        
        # Make prediction
        prediction = model.predict(latitude, longitude, accuracy, data)
        
        result = {
            "risk_level": prediction.risk_level,
            "confidence": prediction.confidence,
            "prediction": prediction.result,
            "insights": prediction.insights,
            "recommendations": prediction.recommendations,
            "safety_alert": prediction.safety_alert,
            "model_version": "1.0",
            "processing_time": prediction.processing_time
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/status', methods=['GET'])
def status():
    return jsonify({
        "status": "running",
        "model_loaded": True,
        "data_loaded": True
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=False)
```

### 5. Environment Variables

Add to your `.env` file:

```env
# Python ML Model Configuration
PYTHON_ML_URL=http://localhost:8000
PYTHON_SCRIPT_PATH=./ml_model/predict.py
CSV_DATA_PATH=./ml_model/data.csv
```

### 6. Running the ML Service

#### Option A: Direct Script Execution
- The Node.js backend will call your Python script directly
- Make sure Python is in your system PATH
- Script should output JSON to stdout

#### Option B: Flask API Service
```bash
cd backend/ml_model
python ml_service.py
```
- Runs on http://localhost:8000
- Node.js backend will use HTTP API calls

### 7. Expected Output Format

Your ML model should return JSON with these fields:

```json
{
  "risk_level": "low|medium|high",
  "confidence": 0.85,
  "prediction": "Your model's prediction result",
  "insights": ["Insight 1", "Insight 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "safety_alert": {
    "type": "alert_type",
    "severity": "low|medium|high",
    "message": "Alert message"
  },
  "model_version": "1.0",
  "processing_time": 0.5
}
```

### 8. Testing

Test your Python script:
```bash
python predict.py 23.0225 72.5714 10.0 user123
```

Test Flask API:
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"latitude": 23.0225, "longitude": 72.5714, "accuracy": 10.0, "userId": "user123"}'
```

### 9. Integration with Mobile App

The mobile app will automatically:
1. Track user location every 5 seconds
2. Send coordinates to Node.js backend
3. Backend forwards to Python ML model
4. ML model analyzes and returns results
5. Results displayed in mobile app

### 10. Troubleshooting

- **Python not found**: Add Python to system PATH
- **Module not found**: Install required packages in requirements.txt
- **JSON parse error**: Ensure your script outputs valid JSON
- **Timeout errors**: Optimize your ML model for faster processing
- **Permission errors**: Check file permissions for CSV and script files
