import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

class ChatService:
    def __init__(self):
        # Get API key
        self.api_key = "YOUR_ACTUAL_GEMINI_API_KEY"  # Replace with your actual key
        
        # Configure Gemini
        genai.configure(api_key=self.api_key)
        
        # Set up the model
        self.model = genai.GenerativeModel('gemini-pro')

    def get_response(self, message):
        try:
            # Define the context
            context = """
            I am an AI assistant for the ML Analytics platform. I can help with:

            1. Data Upload & Processing:
            - How to upload CSV files
            - Data validation process
            - Column type detection
            - Data preprocessing steps

            2. EDA (Exploratory Data Analysis):
            - Available visualizations
            - How to use interactive plots
            - Understanding correlation heatmaps
            - Interpreting statistical summaries

            3. Model Training:
            - Available regression models
            - How to select target variables
            - Understanding performance metrics
            - Model comparison features

            4. Visualization Features:
            - Types of plots available
            - How to interact with graphs
            - Customizing visualizations
            - Exporting results

            5. Platform Navigation:
            - Finding specific features
            - Using the dashboard
            - Accessing results
            - Understanding insights
            """

            # Combine context and user message
            prompt = f"{context}\n\nUser Question: {message}\nPlease provide a helpful response about the platform features:"

            # Generate response
            response = self.model.generate_content(prompt)
            
            return response.text

        except Exception as e:
            print(f"Gemini API Error: {str(e)}")
            raise e 