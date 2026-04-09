from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

# Import our autonomous agents
from vision.fire_detector import FireSmokeDetector
from sensors.anomaly_detector import SensorAnomalyDetector
from dispatch.nlp_commander import NLPDispatchCommander
from chat.ai_assistant import EvacuAidChatAssistant

app = FastAPI(
    title="EvacuAid AI Orchestrator",
    description="Central AI backend for detecting anomalies, running CV on camera grids, and dispatching authorities.",
    version="1.0.0"
)

# Initialize AI singletons
print("Booting EvacuAid AI Engine...")
vision_ai = FireSmokeDetector()
sensor_ai = SensorAnomalyDetector()
dispatch_ai = NLPDispatchCommander()
chat_ai = EvacuAidChatAssistant()

# Pre-train the anomaly detector on boot so it's ready for fast inference
sensor_ai.train_on_baseline()

# --- Pydantic Schemas ---
class SensorPayload(BaseModel):
    device_id: str
    location: str
    temperature: float
    co2: float
    pm: float
    battery: Optional[float] = None

class VisionPayload(BaseModel):
    camera_id: str
    location: str
    scenario: str = "fire" # for mock testing

class ChatQuery(BaseModel):
    user_query: str
    context: str = "normal"

# --- Endpoints ---

@app.get("/")
def health_check():
    return {"status": "AI Hub Online", "models_loaded": ["YOLOv8", "IsolationForest", "NLPDispatcher"]}


@app.post("/analyze/sensor")
async def analyze_sensor_data(payload: SensorPayload):
    """
    Ingests live time-series telemetry from a physical smoke/fire/temp IoT device.
    Uses Machine Learning to predict if the building state is anomalous.
    """
    prediction = sensor_ai.predict_anomaly({
        "temperature": payload.temperature,
        "co2": payload.co2,
        "pm": payload.pm
    })
    
    # If the AI detects a systemic anomaly, we trigger the NLP Dispatcher
    response = {"status": "analyzed", "anomaly_state": prediction}
    
    if prediction["is_anomaly"] and prediction["suggested_severity"] in ["high", "critical"]:
        dispatch = dispatch_ai.generate_dispatch_payload(
            event_type="Environmental Anomaly (High CO2 / Temp)",
            location=payload.location,
            severity=prediction["suggested_severity"],
            details=f"IsolationForest flagged telemetry. Score: {prediction['anomaly_score']}. CO2: {payload.co2}ppm. Temp: {payload.temperature}C"
        )
        response["dispatched_authority"] = dispatch
        
    return response


@app.post("/analyze/vision")
async def analyze_camera_feed(payload: VisionPayload):
    """
    Simulates ingesting a frame from a CCTV stream and pushing it through YOLOv8 PyTorch.
    """
    # For hackathon demo, we trigger the sim logic to return a dynamic payload
    detection = vision_ai.simulate_detection(scenario=payload.scenario)
    
    response = {"status": "analyzed", "vision_state": detection}
    
    if detection["highest_severity"] in ["high", "critical"]:
        dispatch = dispatch_ai.generate_dispatch_payload(
            event_type="Visual Confirmation of Hazard",
            location=payload.location,
            severity=detection["highest_severity"],
            details=f"YOLOv8 Object Detection matched signature with {(detection['detected_hazards'][0]['confidence']*100):.1f}% confidence."
        )
        response["dispatched_authority"] = dispatch
        
    return response


@app.get("/chat/options")
def get_chat_options(context: str = "normal"):
    """
    Returns quick-reply FAQ buttons contextualized to the building state.
    """
    options = chat_ai.get_predefined_options(context=context)
    return {"status": "success", "options": options}


@app.post("/chat/ask")
def process_dynamic_chat(query: ChatQuery):
    """
    Feeds a custom text string from the user into the Google Gemini LLM wrapper.
    """
    ai_response = chat_ai.ask_dynamic_question(query.user_query)
    return ai_response

# --- Running instructions for Hackathon ---
# Run with: uvicorn main:app --reload --port 8000
