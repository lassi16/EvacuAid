import os
import google.generativeai as genai

class EvacuAidChatAssistant:
    """
    Hybrid (RAG) Conversational AI Assistant using Google Gemini.
    Provides structured fast-reply options and fully generative dynamic answers.
    """
    
    def __init__(self):
        # Configure Gemini API
        # Using a mock-safe fallback if the environment doesn't have an API key.
        self.api_key = os.getenv("GEMINI_API_KEY", None)
        self.system_prompt = (
            "You are EvacuAid AI, a highly intelligent safety and emergency response assistant. "
            "You provide calm, clear, and actionable advice to building occupants regarding safety protocols, "
            "fire exits, and navigating the digital map space. Keep answers concise, strictly under 3 sentences, "
            "and prioritize human safety."
        )
        
        if self.api_key:
            genai.configure(api_key=self.api_key)
            # Use gemini-pro for pure text-based natural conversations
            self.model = genai.GenerativeModel(
                'gemini-pro',
                system_instruction=self.system_prompt
            )
        else:
            self.model = None

    def get_predefined_options(self, context: str = "normal") -> list:
        """
        Dynamically returns contextual quick-reply buttons based on the current building state.
        """
        if context == "emergency":
            return [
                {"id": "eq1", "text": "Where is the nearest safe stairwell?"},
                {"id": "eq2", "text": "Report someone trapped."},
                {"id": "eq3", "text": "How do I use a Fire Extinguisher?"}
            ]
            
        return [
            {"id": "nq1", "text": "Show me the building map."},
            {"id": "nq2", "text": "Where is the primary assembly point?"},
            {"id": "nq3", "text": "Contact facility management."}
        ]

    def ask_dynamic_question(self, user_query: str) -> dict:
        """
        Takes any free-form string from the user and processes it via the Gemini model.
        """
        # If running locally for a hackathon without a live API key set in ENV, return a simulated generation!
        if not self.model or not self.api_key:
            return {
                "response": f"[Simulated Gemini Response] For your safety regarding '{user_query}', please follow the blue guided path on the EvacuAid building map. Do not use elevators if a fire alarm is active.",
                "source": "mock_gemini",
                "status": "success"
            }

        try:
            # The 'live' execution if an API key is provided
            # Standard generation call
            response = self.model.generate_content(user_query)
            
            return {
                "response": response.text,
                "source": "gemini_pro",
                "status": "success"
            }
        except Exception as e:
            return {
                "response": f"System Error: Unable to fetch intelligent response. {str(e)}",
                "source": "error",
                "status": "failed"
            }

# Example usage for standalone testing
if __name__ == "__main__":
    assistant = EvacuAidChatAssistant()
    print("Options:", assistant.get_predefined_options())
    print("\nGemini Response:", assistant.ask_dynamic_question("I left my laptop in the server room but there is smoke, what should I do?"))
