import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

class SensorAnomalyDetector:
    """
    Time-Series ML Model using Isolation Forest.
    Analyzes multi-dimensional raw data from Smoke, IoT and Temp sensors 
    to proactively identify systemic anomalies before a physical fire triggers standard alarms.
    """
    
    def __init__(self):
        # Isolation Forest is great for detecting high-dimensional outliers
        self.model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
        self.is_trained = False
        
    def train_on_baseline(self, historical_data_csv: str = None):
        """
        Trains the model on 'normal' operational state of the building.
        For hackathon purposes, we generate synthetic baseline data.
        """
        print("Training Auto-Anomaly Detection Model on baseline building telemetry...")
        # Synthetic data: Temperature (C), CO2 (ppm), Battery (%), Particulate Matter (ug/m3)
        np.random.seed(42)
        normal_temps = np.random.normal(22.0, 1.5, 1000)
        normal_co2 = np.random.normal(400.0, 20.0, 1000)
        normal_pm = np.random.normal(10.0, 2.0, 1000)
        
        # Combine into features array
        X_train = np.column_stack((normal_temps, normal_co2, normal_pm))
        
        # Train
        self.model.fit(X_train)
        self.is_trained = True
        print("Model trained successfully.")

    def predict_anomaly(self, sensor_readings: dict) -> dict:
        """
        Evaluates a live sensor pulse.
        """
        if not self.is_trained:
            self.train_on_baseline()
            
        # Parse readings
        temp = sensor_readings.get('temperature', 22.0)
        co2 = sensor_readings.get('co2', 400.0)
        pm = sensor_readings.get('pm', 10.0)
        
        X_input = np.array([[temp, co2, pm]])
        
        # predict() returns 1 for normal, -1 for anomaly
        prediction = self.model.predict(X_input)[0]
        # decision_function() returns anomaly score (lower is more abnormal)
        score = self.model.decision_function(X_input)[0]

        is_anomaly = bool(prediction == -1)
        
        # Determine strict severity based on how negative the score is
        severity = "normal"
        if is_anomaly:
            if score < -0.15:
                severity = "critical"
            else:
                severity = "high"

        return {
            "is_anomaly": is_anomaly,
            "anomaly_score": round(float(score), 4),
            "suggested_severity": severity,
            "readings": sensor_readings
        }

if __name__ == "__main__":
    detector = SensorAnomalyDetector()
    detector.train_on_baseline()
    
    # Test a normal room
    print("Normal Room:", detector.predict_anomaly({"temperature": 23.0, "co2": 410, "pm": 12.0}))
    
    # Test a room where a fire might be secretly starting (Rapid temp spike, high CO2)
    print("Danger Room:", detector.predict_anomaly({"temperature": 45.0, "co2": 1200, "pm": 150.0}))
