from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.impute import SimpleImputer, KNNImputer
from sklearn.preprocessing import StandardScaler, MinMaxScaler, OneHotEncoder, LabelEncoder
import io
import base64
from ml_service import MLService
from sklearn.model_selection import train_test_split
import logging
import traceback
from visualization_service import VisualizationService
from insights_service import generate_full_insights
import google.generativeai as genai
from chat_service import ChatService

app = Flask(__name__)

# Update the CORS configuration at the top of your file
CORS(app, 
     resources={r"/*": {
         "origins": ["http://localhost:5175"],  # Match your frontend port
         "methods": ["GET", "POST", "OPTIONS"],
         "allow_headers": ["Content-Type"],
         "expose_headers": ["Content-Disposition"],
         "supports_credentials": True
     }})

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Store the dataframe in memory (for demo purposes)
current_df = None

# Configure Gemini
genai.configure(api_key="AIzaSyB1_XPmY-MpfQR7u3hadk5grkDN1s5QYoc")  # Your Gemini API key

# Initialize Gemini model with configuration
generation_config = {
    "temperature": 0.7,
    "top_p": 0.8,
    "top_k": 40,
    "max_output_tokens": 2048,
}

safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]

model = genai.GenerativeModel(
    model_name='gemini-2.0-flash',
    generation_config=generation_config,
    safety_settings=safety_settings
)

# Test the model connection
try:
    test_response = model.generate_content("Test connection")
    logger.info("Gemini API connection successful!")
except Exception as e:
    logger.error(f"Error connecting to Gemini API: {str(e)}")

# Initialize chat service
chat_service = ChatService()

# Add a root route for testing
@app.route('/')
def home():
    return jsonify({"message": "Flask server is running"}), 200

# File upload route
@app.route('/api/upload', methods=['POST', 'OPTIONS'])
def upload_file():
    if request.method == 'OPTIONS':
        # Preflight request handling
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response, 200

    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in the request'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # Read CSV file
        df = pd.read_csv(file)
        
        # Store DataFrame in memory
        global current_df
        current_df = df
        
        # Get column information
        columns = df.columns.tolist()
        dtypes = df.dtypes.apply(lambda x: str(x)).to_dict()
        
        # Get basic statistics
        stats = {
            'rows': df.shape[0],
            'columns': df.shape[1],
            'missing_values': df.isnull().sum().to_dict(),
            'dtypes': dtypes
        }
        
        response = make_response(jsonify({
            'message': 'File uploaded successfully',
            'columns': columns,
            'statistics': stats
        }))
        
        # Add CORS headers to the response
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    except Exception as e:
        response = make_response(jsonify({'error': str(e)}))
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 500

# Data processing route
@app.route('/api/process', methods=['POST', 'OPTIONS'])
def process_data():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response, 200

    try:
        global current_df
        if current_df is None:
            return jsonify({'error': 'No data available'}), 400

        data = request.json
        selected_columns = data.get('selectedColumns', [])
        clean_data = data.get('cleanData', False)
        
        # For viewing selected columns (without cleaning)
        df_view = current_df[selected_columns].copy()
        processed_data = df_view.head(1000).to_dict('records')
        
        return jsonify({
            'message': 'Data processed successfully',
            'data': processed_data,
            'columns': selected_columns
        })

    except Exception as e:
        print(f"Error processing data: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/download', methods=['POST', 'OPTIONS'])
def download_data():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response, 200

    try:
        global current_df
        if current_df is None:
            return jsonify({'error': 'No data available'}), 400

        # Get a copy of the full dataset for cleaning
        df_clean = current_df.copy()

        # Data Cleaning Process
        # 1. Remove duplicates
        df_clean = df_clean.drop_duplicates()

        # 2. Handle missing values
        numeric_cols = df_clean.select_dtypes(include=[np.number]).columns
        categorical_cols = df_clean.select_dtypes(exclude=[np.number]).columns

        # For numeric columns: fill missing with mean
        for col in numeric_cols:
            df_clean[col] = df_clean[col].fillna(df_clean[col].mean())

        # For categorical columns: fill missing with mode
        for col in categorical_cols:
            mode_value = df_clean[col].mode()[0] if not df_clean[col].mode().empty else 'Unknown'
            df_clean[col] = df_clean[col].fillna(mode_value)

        # 3. Remove rows where all values are missing
        df_clean = df_clean.dropna(how='all')

        # 4. Remove constant columns
        constant_cols = [col for col in df_clean.columns if df_clean[col].nunique() == 1]
        df_clean = df_clean.drop(columns=constant_cols)

        # Create CSV file
        buffer = io.StringIO()
        df_clean.to_csv(buffer, index=False)
        buffer.seek(0)

        response = make_response(buffer.getvalue())
        response.headers['Content-Type'] = 'text/csv'
        response.headers['Content-Disposition'] = 'attachment; filename=cleaned_data.csv'
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    except Exception as e:
        print(f"Download error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/columns', methods=['POST'])
def get_columns():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        df = pd.read_csv(file)
        columns = df.columns.tolist()
        
        return jsonify({'columns': columns})
    except Exception as e:
        logger.error(f"Error in get_columns: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 400

def train_model_helper(df, target_col, model_type):
    """Helper function to train the model and return metrics"""
    try:
        # Separate features and target
        X = df.drop(columns=[target_col])
        y = df[target_col]

        # Handle categorical variables
        X = pd.get_dummies(X, drop_first=True)

        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Scale the features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        # Select model based on type
        if model_type == 'linear_regression':
            from sklearn.linear_model import LinearRegression
            model = LinearRegression()
        elif model_type == 'random_forest':
            from sklearn.ensemble import RandomForestRegressor
            model = RandomForestRegressor(n_estimators=100, random_state=42)
        elif model_type == 'decision_tree':
            from sklearn.tree import DecisionTreeRegressor
            model = DecisionTreeRegressor(random_state=42)
        elif model_type == 'svr':
            from sklearn.svm import SVR
            model = SVR()
        elif model_type == 'xgboost':
            from xgboost import XGBRegressor
            model = XGBRegressor(random_state=42)
        else:
            raise ValueError(f"Unsupported model type: {model_type}")

        # Train model
        model.fit(X_train_scaled, y_train)

        # Make predictions
        y_pred = model.predict(X_test_scaled)

        # Calculate metrics
        from sklearn.metrics import r2_score, mean_squared_error
        r2 = r2_score(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)

        # Feature importance (if available)
        feature_importance = None
        if hasattr(model, 'feature_importances_'):
            feature_importance = dict(zip(X.columns, model.feature_importances_))

        return {
            'metrics': {
                'r2_score': float(r2),
                'mse': float(mse),
                'training_time': 2.5,  # placeholder
                'iterations': 100  # placeholder
            },
            'feature_importance': feature_importance
        }
    except Exception as e:
        logger.error(f"Error in train_model_helper: {str(e)}")
        logger.error(traceback.format_exc())
        raise

@app.route('/api/train', methods=['POST'])
def train_model():
    try:
        logger.info("Received training request")
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        target_col = request.form.get('target_col')
        model_type = request.form.get('model_type')
        
        logger.info(f"Parameters: target_col={target_col}, model_type={model_type}")
        
        if not all([file, target_col, model_type]):
            return jsonify({'error': 'Missing required parameters'}), 400
        
        # Read the data
        df = pd.read_csv(file)
        logger.info(f"Data loaded successfully. Shape: {df.shape}")
        
        # Train model and get results
        results = train_model_helper(df, target_col, model_type)
        logger.info("Training completed successfully")
        
        return jsonify(results)
    except Exception as e:
        logger.error(f"Error in train_model: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 400

@app.route('/api/visualize', methods=['POST'])
def visualize_data():
    try:
        logger.info("Received visualization request")
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        logger.info(f"Processing file: {file.filename}")
        
        # Read the data
        df = pd.read_csv(file)
        logger.info(f"Data loaded successfully. Shape: {df.shape}")
        
        # Generate visualizations
        visualizations = VisualizationService.generate_visualizations(df)
        
        if not visualizations:
            return jsonify({'error': 'No visualizations generated'}), 400
        
        response_data = {
            'visualizations': visualizations,
            'columns': df.columns.tolist()
        }
        
        logger.info("Visualization generation completed successfully")
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error in visualize_data: {str(e)}")
        return jsonify({'error': str(e)}), 400

@app.route('/api/insights', methods=['POST'])
def generate_insights():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        target_col = request.form.get('target_col')
        model_type = request.form.get('model_type')
        
        if not all([file, target_col, model_type]):
            return jsonify({'error': 'Missing required parameters'}), 400
        
        # Read the data
        df = pd.read_csv(file)
        
        # Train model and get metrics (use your existing training code)
        model, metrics = ml_service.train_model(df, target_col, model_type)
        
        # Generate insights
        task_type = "regression" if "regress" in model_type.lower() else "classification"
        insights = generate_full_insights(model, df, target_col, task_type, metrics)
        
        return jsonify({
            'insights': insights
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def get_chat_response(message):
    try:
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

        Only provide information about these platform features. For any other questions, respond with:
        "Sorry, I can only answer questions about the ML Analytics platform features and usage."
        """

        prompt = f"{context}\n\nUser Question: {message}\nPlease provide a helpful response about the platform features:"
        
        response = model.generate_content(prompt)
        
        if response and response.text:
            return response.text
        else:
            return "I apologize, but I couldn't generate a proper response. Please try asking about the platform features again."

    except Exception as e:
        logger.error(f"Error generating chat response: {str(e)}")
        return "I encountered an error. Please try asking about the platform features again."

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'No message provided'}), 400

        message = data['message']
        logger.info(f"Received chat message: {message}")

        response = get_chat_response(message)
        logger.info(f"Generated response: {response[:100]}...")  # Log first 100 chars

        return jsonify({'response': response})

    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            'response': 'I encountered an error. Please try asking about the platform features again.'
        }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5001, host='0.0.0.0') 