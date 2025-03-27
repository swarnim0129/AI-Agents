import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.metrics import accuracy_score, mean_squared_error, classification_report
import io
import base64

class MLService:
    def __init__(self):
        self.model = None
        self.metrics = None
        self.feature_names = None

    def get_encoded_plot(self, fig):
        buf = io.BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        plt.close(fig)
        return base64.b64encode(buf.getvalue()).decode('utf-8')

    def train_model(self, df, target_col, task_type="regression"):
        if target_col not in df.columns:
            raise ValueError(f"Target column '{target_col}' not found!")

        # Separate features and target
        X = df.drop(columns=[target_col])
        y = df[target_col]

        # Encode categorical columns
        X = pd.get_dummies(X, drop_first=True)

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Choose model
        if task_type == "classification":
            model = RandomForestClassifier(n_estimators=100, random_state=42)
        else:
            model = LinearRegression()

        # Train model
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)

        # Evaluation
        if task_type == "classification":
            accuracy = accuracy_score(y_test, y_pred)
            report = classification_report(y_test, y_pred, output_dict=True)
            metrics = {"accuracy": accuracy, "classification_report": report}
        else:
            mse = mean_squared_error(y_test, y_pred)
            r2 = model.score(X_test, y_test)
            metrics = {"mse": mse, "r2_score": r2}

        self.model = model
        self.metrics = metrics
        self.feature_names = X.columns
        return model, metrics, X.columns

    def generate_plots(self, df, target_col, model, feature_names):
        plots = {}
        
        # Feature Importance (only for Random Forest)
        if hasattr(model, 'feature_importances_'):
            fig = plt.figure(figsize=(10, 5))
            importance = model.feature_importances_
            feature_df = pd.DataFrame({"Feature": feature_names, "Importance": importance})
            feature_df = feature_df.sort_values(by="Importance", ascending=False)
            sns.barplot(x="Importance", y="Feature", data=feature_df, palette="Blues_r")
            plt.title("Feature Importance")
            plots['feature_importance'] = self.get_encoded_plot(fig)

        # Correlation Heatmap
        fig = plt.figure(figsize=(10, 8))
        numeric_df = df.select_dtypes(include=[np.number])
        sns.heatmap(numeric_df.corr(), annot=True, cmap="coolwarm", fmt=".2f")
        plt.title("Feature Correlation Heatmap")
        plots['correlation_heatmap'] = self.get_encoded_plot(fig)

        # Actual vs Predicted (for regression)
        if hasattr(model, 'predict'):
            X = pd.get_dummies(df.drop(columns=[target_col]), drop_first=True)
            y_pred = model.predict(X)
            fig = plt.figure(figsize=(8, 6))
            plt.scatter(df[target_col], y_pred, alpha=0.5)
            plt.plot([df[target_col].min(), df[target_col].max()], 
                    [df[target_col].min(), df[target_col].max()], 
                    'r--', lw=2)
            plt.xlabel("Actual Values")
            plt.ylabel("Predicted Values")
            plt.title("Actual vs Predicted Values")
            plots['actual_vs_predicted'] = self.get_encoded_plot(fig)

        return plots 