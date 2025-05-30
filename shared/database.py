import os
import asyncio
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String, DateTime, Text, DECIMAL, ARRAY, JSON
from sqlalchemy.sql import func
from flask import current_app
from neon import neon

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

# Create async engine for SQLAlchemy
engine = create_async_engine(
    DATABASE_URL,
    echo=True if os.getenv('DEBUG') == 'true' else False,
    future=True
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Create Neon SQL client for direct queries
sql = neon(DATABASE_URL)

# SQLAlchemy Base
Base = declarative_base()

# Database Models
class DetectionPattern(Base):
    __tablename__ = 'detection_patterns'
    __table_args__ = {'schema': 'mntrk'}
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String)
    latitude = Column(DECIMAL(10, 8))
    longitude = Column(DECIMAL(11, 8))
    detection_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    confidence_score = Column(DECIMAL(5, 4))
    detection_method = Column(String(50))
    image_url = Column(Text)
    environmental_context = Column(JSON)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now())

class HabitatAnalysis(Base):
    __tablename__ = 'habitat_analyses'
    __table_args__ = {'schema': 'mntrk'}
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String)
    region_name = Column(String(255))
    latitude = Column(DECIMAL(10, 8))
    longitude = Column(DECIMAL(11, 8))
    suitability_score = Column(DECIMAL(5, 4))
    analysis_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    satellite_image_url = Column(Text)
    environmental_data = Column(JSON)
    risk_factors = Column(ARRAY(Text))
    analysis_parameters = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now())

class AIPrediction(Base):
    __tablename__ = 'ai_predictions'
    __table_args__ = {'schema': 'mntrk'}
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String)
    prediction_type = Column(String(50))
    input_data = Column(JSON)
    prediction_result = Column(JSON)
    model_version = Column(String(50))
    confidence_score = Column(DECIMAL(5, 4))
    prediction_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Database functions
def init_db(app):
    """Initialize database connection for Flask app."""
    app.logger.info("Database initialized with Neon PostgreSQL")

@asynccontextmanager
async def get_async_session():
    """Get async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def get_neon_sql():
    """Get Neon SQL client for direct queries."""
    return sql

# Sync wrapper for Flask routes
def get_db_sync():
    """Synchronous database access for Flask routes."""
    return sql

# Database operations
async def create_detection_pattern(data: dict):
    """Create a new detection pattern record."""
    async with get_async_session() as session:
        pattern = DetectionPattern(**data)
        session.add(pattern)
        await session.flush()
        return pattern.id

async def create_habitat_analysis(data: dict):
    """Create a new habitat analysis record."""
    async with get_async_session() as session:
        analysis = HabitatAnalysis(**data)
        session.add(analysis)
        await session.flush()
        return analysis.id

async def create_ai_prediction(data: dict):
    """Create a new AI prediction record."""
    async with get_async_session() as session:
        prediction = AIPrediction(**data)
        session.add(prediction)
        await session.flush()
        return prediction.id

# Direct SQL queries using Neon
async def query_recent_detections(limit: int = 10):
    """Query recent detection patterns using Neon SQL."""
    result = await sql("""
        SELECT id, latitude, longitude, detection_timestamp, confidence_score
        FROM mntrk.detection_patterns 
        ORDER BY detection_timestamp DESC 
        LIMIT $1
    """, limit)
    return result

async def query_habitat_suitability(lat: float, lon: float, radius_km: float = 10):
    """Query habitat suitability in a geographic area."""
    result = await sql("""
        SELECT AVG(suitability_score) as avg_suitability,
               COUNT(*) as analysis_count
        FROM mntrk.habitat_analyses
        WHERE ST_DWithin(
            ST_Point(longitude, latitude)::geography,
            ST_Point($2, $1)::geography,
            $3 * 1000
        )
    """, lat, lon, radius_km)
    return result[0] if result else None
