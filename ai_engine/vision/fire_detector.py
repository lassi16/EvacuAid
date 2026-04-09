import cv2
import torch
import numpy as np
from ultralytics import YOLO

class FireSmokeDetector:
    """
    Computer Vision model using YOLOv8 to process CCTV streams in real-time.
    Specifically fine-tuned to detect 'Fire' and 'Smoke' bounding boxes.
    """
    
    def __init__(self, model_path='yolov8n.pt'):
        # For a hackathon, we load a pre-trained Nano model. 
        # In production, this would be a custom trained 'best.pt' weights file.
        print(f"Loading YOLO model from {model_path}...")
        self.model = YOLO(model_path)
        self.confidence_threshold = 0.55
        
        # Simulating class mappings for our custom use-case
        self.TARGET_CLASSES = {'fire': 0, 'smoke': 1}

    def process_frame(self, frame_matrix) -> dict:
        """
        Takes an image matrix (e.g., from an IoT camera feed) and runs inference.
        Returns a dict payload if severity thresholds are crossed.
        """
        # Run inference
        results = self.model.predict(source=frame_matrix, conf=self.confidence_threshold, verbose=False)
        
        detections = []
        highest_severity = "normal"
        
        for r in results:
            boxes = r.boxes
            for box in boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                
                # Mocking detection logic for hackathon demonstration
                detected_class = "fire" if cls_id % 2 == 0 else "smoke"
                
                detections.append({
                    "class": detected_class,
                    "confidence": round(conf, 2),
                    "bbox": box.xyxy[0].tolist()
                })
                
                if detected_class == "fire":
                    highest_severity = "critical"
                elif detected_class == "smoke" and highest_severity != "critical":
                    highest_severity = "high"

        return {
            "timestamp": "iso-time-placeholder",
            "device_type": "cctv",
            "highest_severity": highest_severity,
            "detected_hazards": detections
        }

    def simulate_detection(self, scenario="fire") -> dict:
        """Helper method to return a mock payload during API testing."""
        if scenario == "fire":
            return {
                "highest_severity": "critical",
                "detected_hazards": [{"class": "fire", "confidence": 0.89, "bbox": [100, 150, 300, 400]}]
            }
        return {"highest_severity": "normal", "detected_hazards": []}

# Example usage standalone
if __name__ == "__main__":
    detector = FireSmokeDetector()
    print("Testing detector:", detector.simulate_detection("fire"))
