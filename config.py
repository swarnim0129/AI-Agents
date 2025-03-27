CORS_ORIGINS = [
    "http://localhost:5174",
    "http://localhost:5173",  # Add any other frontend URLs you use
]

CORS_SETTINGS = {
    "allow_origins": CORS_ORIGINS,
    "allow_credentials": True,
    "allow_methods": ["*"],
    "allow_headers": ["*"],
} 