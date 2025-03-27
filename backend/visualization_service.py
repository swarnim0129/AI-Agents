import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import numpy as np
import json
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class VisualizationService:
    @staticmethod
    def create_histogram(df, column):
        """Generate interactive histogram using Plotly"""
        try:
            fig = px.histogram(
                df, 
                x=column,
                title=f"Distribution of {column}",
                hover_data={column: True},
                marginal="box"  # This adds a box plot on the margin
            )
            fig.update_layout(
                hoverlabel=dict(
                    bgcolor="white",
                    font_size=16,
                    font_family="Rockwell"
                )
            )
            return json.loads(fig.to_json())
        except Exception as e:
            logger.error(f"Error creating histogram for {column}: {str(e)}")
            return None

    @staticmethod
    def create_scatter_plot(df, x_col, y_col):
        """Generate interactive scatter plot using Plotly"""
        try:
            fig = px.scatter(
                df,
                x=x_col,
                y=y_col,
                title=f"{x_col} vs {y_col}",
                hover_data={x_col: True, y_col: True},
                trendline="ols"  # Adds a trend line
            )
            fig.update_layout(
                hoverlabel=dict(
                    bgcolor="white",
                    font_size=16,
                    font_family="Rockwell"
                )
            )
            return json.loads(fig.to_json())
        except Exception as e:
            logger.error(f"Error creating scatter plot: {str(e)}")
            return None

    @staticmethod
    def create_box_plot(df, column):
        """Generate interactive box plot using Plotly"""
        try:
            fig = px.box(
                df,
                y=column,
                title=f"Box Plot of {column}",
                points="all"  # Shows all points
            )
            fig.update_layout(
                hoverlabel=dict(
                    bgcolor="white",
                    font_size=16,
                    font_family="Rockwell"
                )
            )
            return json.loads(fig.to_json())
        except Exception as e:
            logger.error(f"Error creating box plot for {column}: {str(e)}")
            return None

    @staticmethod
    def create_heatmap(df):
        """Generate interactive correlation heatmap using Plotly"""
        try:
            numeric_df = df.select_dtypes(include=[np.number])
            correlation_matrix = numeric_df.corr()
            
            fig = go.Figure(data=go.Heatmap(
                z=correlation_matrix,
                x=correlation_matrix.columns,
                y=correlation_matrix.columns,
                hoverongaps=False,
                text=correlation_matrix.round(2),
                texttemplate="%{text}",
                textfont={"size": 10},
                hovertemplate="X: %{x}<br>Y: %{y}<br>Correlation: %{z:.2f}<extra></extra>"
            ))
            
            fig.update_layout(
                title="Correlation Heatmap",
                hoverlabel=dict(
                    bgcolor="white",
                    font_size=16,
                    font_family="Rockwell"
                )
            )
            
            return json.loads(fig.to_json())
        except Exception as e:
            logger.error(f"Error creating heatmap: {str(e)}")
            return None

    @staticmethod
    def generate_visualizations(df):
        """Generate all visualizations for the dataset"""
        try:
            logger.info("Starting visualization generation")
            visualizations = {}
            
            # Get numeric columns
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            logger.info(f"Found numeric columns: {numeric_cols}")

            # Create heatmap
            logger.info("Generating heatmap")
            heatmap = VisualizationService.create_heatmap(df)
            if heatmap:
                visualizations['correlation_heatmap'] = heatmap

            # Create histograms for numeric columns
            for col in numeric_cols[:3]:
                logger.info(f"Generating histogram for {col}")
                hist = VisualizationService.create_histogram(df, col)
                if hist:
                    visualizations[f'histogram_{col}'] = hist

            # Create box plots for numeric columns
            for col in numeric_cols[:3]:
                logger.info(f"Generating box plot for {col}")
                box = VisualizationService.create_box_plot(df, col)
                if box:
                    visualizations[f'boxplot_{col}'] = box

            # Create scatter plots between first two numeric columns
            if len(numeric_cols) >= 2:
                logger.info("Generating scatter plot")
                scatter = VisualizationService.create_scatter_plot(
                    df, numeric_cols[0], numeric_cols[1]
                )
                if scatter:
                    visualizations['scatter_plot'] = scatter

            logger.info("Completed visualization generation")
            return visualizations

        except Exception as e:
            logger.error(f"Error in generate_visualizations: {str(e)}")
            raise

    @staticmethod
    def process_file(file):
        """Process uploaded file and generate visualizations"""
        try:
            # Read the data
            df = pd.read_csv(file)
            logger.info(f"Data loaded successfully. Shape: {df.shape}")
            
            # Generate visualizations
            visualizations = VisualizationService.generate_visualizations(df)
            
            return {
                'visualizations': visualizations,
                'columns': df.columns.tolist(),
                'shape': df.shape
            }
        except Exception as e:
            logger.error(f"Error processing file: {str(e)}")
            raise