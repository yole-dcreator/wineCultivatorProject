"""
Wine Cultivar Origin Prediction System
Web Application using Flask
"""

from flask import Flask, render_template, request, jsonify
import joblib
import numpy as np
import os
from pathlib import Path

app = Flask(__name__)

# Get the directory of the current script
BASE_DIR = Path(__file__).parent

# Load the trained model, scaler, and selected features
try:
    model = joblib.load(BASE_DIR / 'model' / 'wine_cultivar_model.pkl')
    scaler = joblib.load(BASE_DIR / 'model' / 'scaler.pkl')
    selected_features = joblib.load(BASE_DIR / 'model' / 'selected_features.pkl')
    print("✓ Model, scaler, and features loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None
    scaler = None
    selected_features = None

# Cultivar names mapping
CULTIVAR_NAMES = {
    0: "Cultivar 1",
    1: "Cultivar 2",
    2: "Cultivar 3"
}

@app.route('/')
def index():
    """Render the main page"""
    return render_template('index.html', features=selected_features)

@app.route('/predict', methods=['POST'])
def predict():
    """Make prediction based on user input"""
    try:
        # Get JSON data from request
        data = request.get_json()
        
        # Extract feature values
        feature_values = []
        for feature in selected_features:
            value = float(data.get(feature, 0))
            feature_values.append(value)
        
        # Convert to numpy array and reshape
        X = np.array(feature_values).reshape(1, -1)
        
        # Scale the features
        X_scaled = scaler.transform(X)
        
        # Make prediction
        prediction = model.predict(X_scaled)[0]
        probabilities = model.predict_proba(X_scaled)[0]
        
        # Prepare response
        cultivar_name = CULTIVAR_NAMES.get(prediction, f"Cultivar {prediction + 1}")
        
        response = {
            'success': True,
            'predicted_cultivar': cultivar_name,
            'predicted_class': int(prediction),
            'confidence': float(probabilities[prediction] * 100),
            'probabilities': {
                f'Cultivar {i+1}': float(prob * 100) 
                for i, prob in enumerate(probabilities)
            },
            'input_features': {
                feature: float(feature_values[i]) 
                for i, feature in enumerate(selected_features)
            }
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/features', methods=['GET'])
def get_features():
    """Get the list of features used by the model"""
    return jsonify({
        'features': selected_features,
        'feature_count': len(selected_features),
        'model_algorithm': 'Random Forest Classifier',
        'model_accuracy': 0.9722
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'scaler_loaded': scaler is not None
    })

if __name__ == '__main__':
    # Check if model files exist
    model_path = BASE_DIR / 'model' / 'wine_cultivar_model.pkl'
    if not model_path.exists():
        print(f"Warning: Model file not found at {model_path}")
    
    # Run Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)
