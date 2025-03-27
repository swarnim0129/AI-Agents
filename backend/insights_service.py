import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

def extract_feature_importance(model, feature_names, task_type="classification", top_n=5):
    """Extracts and formats feature importance insights from a trained model."""
    insights = {}
    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
        feature_importance = pd.DataFrame({"Feature": feature_names, "Importance": importances})
        feature_importance = feature_importance.sort_values(by="Importance", ascending=False).head(top_n)
        insights["top_features"] = feature_importance.to_dict("records")
    elif hasattr(model, "coef_"):
        coef = np.abs(model.coef_.flatten())
        feature_importance = pd.DataFrame({"Feature": feature_names, "Coefficient Magnitude": coef})
        feature_importance = feature_importance.sort_values(by="Coefficient Magnitude", ascending=False).head(top_n)
        insights["top_features_coefficients"] = feature_importance.to_dict("records")
    return insights

def analyze_model_performance(metrics, task_type):
    """Analyzes statistical output metrics and generates insights."""
    insights = {}
    if task_type == "classification":
        accuracy = metrics.get("accuracy")
        if accuracy:
            insights["accuracy_insight"] = f"Model achieved {accuracy:.4f} accuracy."
        f1_score = metrics.get("classification_report", {}).get("weighted avg", {}).get("f1-score")
        if f1_score:
            insights["f1_score_insight"] = f"Weighted F1-score is {f1_score:.4f}."
    elif task_type == "regression":
        mse = metrics.get("mse")
        r2 = metrics.get("r2")
        if mse:
            insights["mse_insight"] = f"Mean Squared Error: {mse:.4f}."
        if r2:
            insights["r2_insight"] = f"R² score: {r2:.4f}."
    return insights

def generate_business_intelligence_insights(feature_insights, statistical_insights):
    """Generates business intelligence insights."""
    business_insights = {}
    if feature_insights.get("top_features"):
        top_features = ", ".join([f["Feature"] for f in feature_insights["top_features"][:3]])
        business_insights["key_drivers"] = f"Key factors influencing outcomes are {top_features}."
    if statistical_insights.get("accuracy_insight"):
        business_insights["overall_performance"] = statistical_insights["accuracy_insight"]
    return business_insights

def generate_innovation_rd_insights(df, feature_insights, statistical_insights, target_col):
    """Identifies outliers, correlations, and suggests feature engineering."""
    insights = {}

    # Detect Outliers
    try:
        numeric_df = df.select_dtypes(include=np.number).dropna(axis=1, how="all")
        if not numeric_df.empty:
            model_iforest = IsolationForest(contamination="auto", random_state=42)
            outlier_pred = model_iforest.fit_predict(numeric_df)
            outlier_count = len(numeric_df.index[outlier_pred == -1])
            if outlier_count > 0:
                insights["outliers_detected"] = f"Detected {outlier_count} potential outliers."
    except Exception as e:
        insights["outlier_error"] = f"Error in outlier detection: {e}"

    # Feature Correlations
    try:
        target_corr = df.corr(numeric_only=True)[target_col].drop(target_col)
        top_corr_features = ", ".join(abs(target_corr).sort_values(ascending=False).head(3).index.tolist())
        if top_corr_features:
            insights["correlation_insight"] = f"Strong correlations found with {top_corr_features}."
    except Exception as e:
        insights["correlation_error"] = f"Error in correlation analysis: {e}"

    return insights

def generate_research_directions_insights(statistical_insights, task_type):
    """Generates research directions for improving model performance."""
    insights = {}
    if task_type == "classification":
        accuracy = float(statistical_insights.get("accuracy_insight", "").split()[-1].rstrip("%")) if "accuracy_insight" in statistical_insights else None
        if accuracy and accuracy > 95:
            insights["high_accuracy_finding"] = "High accuracy achieved (>95%). Focus on model robustness."
    if task_type == "regression" and "r2_insight" in statistical_insights:
        r2_value = float(statistical_insights["r2_insight"].split()[-1].rstrip("."))
        if r2_value < 0.7:
            insights["feature_engineering_potential"] = "R² suggests improvement via feature engineering."
    return insights

def generate_insights_summary(business_insights, innovation_insights, research_insights):
    """Generates a final insights report."""
    summary = ["**📌 Insights Report**\n"]
    
    if business_insights:
        summary.append("### 🔹 Business Intelligence")
        for insight in business_insights.values():
            summary.append(f"- {insight}")

    if innovation_insights:
        summary.append("\n### 🔹 Innovation & R&D")
        for insight in innovation_insights.values():
            summary.append(f"- {insight}")

    if research_insights:
        summary.append("\n### 🔹 Research Directions")
        for insight in research_insights.values():
            summary.append(f"- {insight}")

    return "\n".join(summary)

def generate_full_insights(model, df, target_col, task_type, metrics):
    """Runs all insight generation functions."""
    feature_insights = extract_feature_importance(model, df.drop(columns=[target_col]).columns, task_type)
    statistical_insights = analyze_model_performance(metrics, task_type)
    business_insights = generate_business_intelligence_insights(feature_insights, statistical_insights)
    innovation_insights = generate_innovation_rd_insights(df, feature_insights, statistical_insights, target_col)
    research_insights = generate_research_directions_insights(statistical_insights, task_type)

    return generate_insights_summary(business_insights, innovation_insights, research_insights)

# Example Usage:
# df = pd.read_csv("your_data.csv")
# trained_model, metrics = train_your_model(df, "target_column")  # Replace with actual function
# insights_report = generate_full_insights(trained_model, df, "target_column", "classification", metrics)
# print(insights_report)