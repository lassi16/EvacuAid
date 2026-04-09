import os
import json

class NLPDispatchCommander:
    """
    NLP Generative Agent (Mocked for Hackathon logic).
    Takes physical hazard classifications and transforms them into 
    highly legible, actionable dispatch JSON payloads intended for automated messaging
    to "Fire Dept", "Medical", etc.
    """
    
    def __init__(self):
        # We would typically init openai.ChatCompletion here.
        # openai.api_key = os.getenv("OPENAI_API_KEY")
        self.active_departments = ["Fire Dept", "Medical Staff", "Security Team", "Hazmat Unit"]
        
    def generate_dispatch_payload(self, event_type: str, location: str, severity: str, details: str):
        """
        Uses heuristic AI to map the optimal emergency team and constructs an automated message.
        """
        # 1. Determine primary team based on context
        primary_team = "Security Team"
        if "fire" in event_type.lower() or "smoke" in event_type.lower():
            primary_team = "Fire Dept"
        elif "medical" in event_type.lower():
            primary_team = "Medical Staff"
        elif "hazardous" in event_type.lower() or "chemical" in event_type.lower():
            primary_team = "Hazmat Unit"

        # 2. Assign Response Priority
        priority_level = "P1-CRITICAL" if severity == "critical" else "P2-HIGH" if severity == "high" else "P3-MEDIUM"

        # 3. Formulate the dynamic text string
        auto_message = (
            f"URGENT: {priority_level} dispatch required at {location}. "
            f"AI detected {event_type}. Details: {details}. "
            f"Please proceed with extreme caution."
        )

        return {
            "dispatch_to": primary_team,
            "priority": priority_level,
            "automated_broadcast": auto_message,
            "map_action": "highlight_evacuation_routes",
            "eta_prediction_mins": 5 if severity == "critical" else 15
        }

if __name__ == "__main__":
    commander = NLPDispatchCommander()
    response = commander.generate_dispatch_payload(
        event_type="Fire Anomaly",
        location="Floor 3, Server Room",
        severity="critical",
        details="YOLOv8 detected high-confidence flame profile alongside temperature spike."
    )
    print(json.dumps(response, indent=2))
