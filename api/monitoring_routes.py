from flask import Blueprint, request, jsonify
from ml_pipeline.training_manager import training_manager
from ml_pipeline.pipeline import get_pipeline
from symbolic_engine.engine import symbolic_engine
import asyncio
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

monitoring_bp = Blueprint('monitoring', __name__)

@monitoring_bp.route('/monitoring/status', methods=['GET'])
async def get_system_status():
    """Get comprehensive system status for all AI components."""
    try:
        # Get ML Pipeline status
        pipeline = await get_pipeline()
        ml_status = await pipeline.get_model_status()
        
        # Get Training Manager status
        training_triggers = await training_manager.check_training_trigger()
        
        # Get Symbolic Engine status
        symbolic_status = await symbolic_engine.get_status()
        
        # Check recent activity
        recent_activity = await _check_recent_activity()
        
        # Check learning indicators
        learning_indicators = await _check_learning_indicators()
        
        system_status = {
            'timestamp': datetime.now().isoformat(),
            'overall_status': 'active' if any(training_triggers.values()) else 'monitoring',
            'ml_pipeline': {
                'status': ml_status,
                'models_loaded': ml_status.get('models_loaded', False),
                'last_prediction': ml_status.get('last_updated')
            },
            'training_system': {
                'active_triggers': training_triggers,
                'needs_training': any(training_triggers.values()),
                'training_threshold': training_manager.retrain_threshold,
                'min_samples': training_manager.min_training_samples
            },
            'symbolic_reasoning': {
                'status': symbolic_status,
                'rules_loaded': symbolic_status.get('rules_loaded', False),
                'inference_count': symbolic_status.get('inference_history_count', 0)
            },
            'recent_activity': recent_activity,
            'learning_indicators': learning_indicators,
            'synthetic_data': {
                'mostlyai_config': training_manager.mostlyai_config,
                'generator_active': True
            }
        }
        
        return jsonify({
            'status': 'success',
            'system_status': system_status
        })
        
    except Exception as e:
        logger.error(f"Error getting system status: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@monitoring_bp.route('/monitoring/learning-activity', methods=['GET'])
async def get_learning_activity():
    """Get detailed learning activity across all components."""
    try:
        # Check training activity
        training_activity = await _get_training_activity()
        
        # Check prediction activity
        prediction_activity = await _get_prediction_activity()
        
        # Check data ingestion
        ingestion_activity = await _get_ingestion_activity()
        
        # Check model performance trends
        performance_trends = await _get_performance_trends()
        
        learning_activity = {
            'timestamp': datetime.now().isoformat(),
            'training': training_activity,
            'predictions': prediction_activity,
            'data_ingestion': ingestion_activity,
            'performance_trends': performance_trends,
            'learning_rate': _calculate_learning_rate(training_activity, prediction_activity)
        }
        
        return jsonify({
            'status': 'success',
            'learning_activity': learning_activity
        })
        
    except Exception as e:
        logger.error(f"Error getting learning activity: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@monitoring_bp.route('/monitoring/ai-agents', methods=['GET'])
async def get_ai_agents_status():
    """Get status of all AI agents and their learning state."""
    try:
        agents_status = {
            'habitat_agent': await _check_habitat_agent_status(),
            'detection_agent': await _check_detection_agent_status(),
            'movement_agent': await _check_movement_agent_status(),
            'anomaly_agent': await _check_anomaly_agent_status(),
            'symbolic_agent': await _check_symbolic_agent_status()
        }
        
        # Calculate overall agent health
        active_agents = sum(1 for agent in agents_status.values() if agent.get('status') == 'active')
        total_agents = len(agents_status)
        
        return jsonify({
            'status': 'success',
            'agents_status': agents_status,
            'summary': {
                'active_agents': active_agents,
                'total_agents': total_agents,
                'health_percentage': (active_agents / total_agents) * 100,
                'timestamp': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting AI agents status: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@monitoring_bp.route('/monitoring/live-training', methods=['GET'])
async def check_live_training():
    """Check if training is currently active and live."""
    try:
        # Check active training sessions
        db = training_manager.db
        
        # Get recent training history
        recent_training = db.collection('training_history').where(
            'timestamp', '>', datetime.now() - timedelta(hours=1)
        ).stream()
        
        active_sessions = []
        for doc in recent_training:
            session = doc.to_dict()
            session['id'] = doc.id
            active_sessions.append(session)
        
        # Check model registry for recent updates
        recent_models = db.collection('model_registry').where(
            'created_at', '>', datetime.now() - timedelta(hours=24)
        ).stream()
        
        recent_model_updates = []
        for doc in recent_models:
            model = doc.to_dict()
            model['id'] = doc.id
            recent_model_updates.append(model)
        
        # Check training triggers
        training_triggers = await training_manager.check_training_trigger()
        
        live_training_status = {
            'is_live': len(active_sessions) > 0 or any(training_triggers.values()),
            'active_sessions': active_sessions,
            'recent_model_updates': recent_model_updates,
            'pending_triggers': training_triggers,
            'last_check': datetime.now().isoformat(),
            'training_frequency': 'continuous',
            'auto_retrain_enabled': True
        }
        
        return jsonify({
            'status': 'success',
            'live_training': live_training_status
        })
        
    except Exception as e:
        logger.error(f"Error checking live training: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

async def _check_recent_activity():
    """Check recent system activity."""
    try:
        db = training_manager.db
        
        # Check recent data ingestion
        recent_detections = db.collection('detection_patterns').where(
            'created_at', '>', datetime.now() - timedelta(hours=1)
        ).stream()
        
        recent_habitats = db.collection('habitat_analyses').where(
            'created_at', '>', datetime.now() - timedelta(hours=1)
        ).stream()
        
        return {
            'recent_detections': len(list(recent_detections)),
            'recent_habitat_analyses': len(list(recent_habitats)),
            'last_hour_activity': True
        }
    except Exception as e:
        logger.error(f"Error checking recent activity: {e}")
        return {'error': str(e)}

async def _check_learning_indicators():
    """Check indicators that the system is actively learning."""
    try:
        db = training_manager.db
        
        # Check model performance improvements
        models = db.collection('model_registry').order_by('created_at', direction='DESCENDING').limit(5).stream()
        model_metrics = []
        
        for doc in models:
            model = doc.to_dict()
            if 'metrics' in model:
                model_metrics.append(model['metrics'])
        
        # Check if accuracy is improving
        accuracy_trend = 'improving' if len(model_metrics) > 1 and model_metrics[0].get('accuracy', 0) > model_metrics[-1].get('accuracy', 0) else 'stable'
        
        return {
            'model_performance_trend': accuracy_trend,
            'recent_model_count': len(model_metrics),
            'learning_active': len(model_metrics) > 0,
            'synthetic_data_integration': True
        }
    except Exception as e:
        logger.error(f"Error checking learning indicators: {e}")
        return {'error': str(e)}

async def _get_training_activity():
    """Get training activity details."""
    try:
        db = training_manager.db
        
        # Get training sessions from last 24 hours
        recent_training = db.collection('training_history').where(
            'timestamp', '>', datetime.now() - timedelta(hours=24)
        ).stream()
        
        sessions = list(recent_training)
        
        return {
            'sessions_last_24h': len(sessions),
            'training_active': len(sessions) > 0,
            'last_training': sessions[0].to_dict() if sessions else None
        }
    except Exception as e:
        logger.error(f"Error getting training activity: {e}")
        return {'error': str(e)}

async def _get_prediction_activity():
    """Get prediction activity details."""
    try:
        db = training_manager.db
        
        # Get predictions from last hour
        recent_predictions = db.collection('ai_predictions').where(
            'created_at', '>', datetime.now() - timedelta(hours=1)
        ).stream()
        
        predictions = list(recent_predictions)
        
        return {
            'predictions_last_hour': len(predictions),
            'prediction_active': len(predictions) > 0,
            'prediction_types': list(set([p.to_dict().get('prediction_type') for p in predictions]))
        }
    except Exception as e:
        logger.error(f"Error getting prediction activity: {e}")
        return {'error': str(e)}

async def _get_ingestion_activity():
    """Get data ingestion activity."""
    try:
        db = training_manager.db
        
        # Check various data sources
        collections = ['mastomys_sightings', 'detection_patterns', 'environmental_data']
        ingestion_stats = {}
        
        for collection in collections:
            recent_docs = db.collection(collection).where(
                'created_at', '>', datetime.now() - timedelta(hours=1)
            ).stream()
            ingestion_stats[collection] = len(list(recent_docs))
        
        return {
            'ingestion_stats': ingestion_stats,
            'total_recent_ingestion': sum(ingestion_stats.values()),
            'ingestion_active': sum(ingestion_stats.values()) > 0
        }
    except Exception as e:
        logger.error(f"Error getting ingestion activity: {e}")
        return {'error': str(e)}

async def _get_performance_trends():
    """Get model performance trends."""
    try:
        db = training_manager.db
        
        # Get recent model performance
        models = db.collection('model_registry').order_by('created_at', direction='DESCENDING').limit(10).stream()
        
        performance_data = []
        for doc in models:
            model = doc.to_dict()
            if 'metrics' in model:
                performance_data.append({
                    'timestamp': model.get('created_at'),
                    'accuracy': model['metrics'].get('accuracy', 0),
                    'model_type': model.get('model_type')
                })
        
        return {
            'recent_models': len(performance_data),
            'performance_data': performance_data,
            'trend_available': len(performance_data) > 1
        }
    except Exception as e:
        logger.error(f"Error getting performance trends: {e}")
        return {'error': str(e)}

def _calculate_learning_rate(training_activity, prediction_activity):
    """Calculate overall system learning rate."""
    training_score = min(training_activity.get('sessions_last_24h', 0) / 10, 1.0)
    prediction_score = min(prediction_activity.get('predictions_last_hour', 0) / 100, 1.0)
    
    return {
        'overall_rate': (training_score + prediction_score) / 2,
        'training_component': training_score,
        'prediction_component': prediction_score,
        'status': 'high' if (training_score + prediction_score) / 2 > 0.7 else 'moderate' if (training_score + prediction_score) / 2 > 0.3 else 'low'
    }

async def _check_habitat_agent_status():
    """Check habitat prediction agent status."""
    try:
        pipeline = await get_pipeline()
        habitat_status = await pipeline.habitat_predictor.get_status()
        
        return {
            'status': 'active' if habitat_status.get('model_loaded') else 'inactive',
            'model_loaded': habitat_status.get('model_loaded', False),
            'version': habitat_status.get('version'),
            'last_updated': habitat_status.get('last_updated')
        }
    except Exception as e:
        return {'status': 'error', 'error': str(e)}

async def _check_detection_agent_status():
    """Check detection pattern agent status."""
    try:
        # Check recent detection processing
        db = training_manager.db
        recent_detections = db.collection('detection_patterns').where(
            'created_at', '>', datetime.now() - timedelta(hours=1)
        ).stream()
        
        return {
            'status': 'active',
            'recent_detections': len(list(recent_detections)),
            'processing_active': True
        }
    except Exception as e:
        return {'status': 'error', 'error': str(e)}

async def _check_movement_agent_status():
    """Check movement prediction agent status."""
    try:
        pipeline = await get_pipeline()
        movement_status = await pipeline.movement_predictor.get_status()
        
        return {
            'status': 'active' if movement_status.get('model_loaded') else 'inactive',
            'model_loaded': movement_status.get('model_loaded', False),
            'version': movement_status.get('version')
        }
    except Exception as e:
        return {'status': 'error', 'error': str(e)}

async def _check_anomaly_agent_status():
    """Check anomaly detection agent status."""
    try:
        pipeline = await get_pipeline()
        anomaly_status = await pipeline.anomaly_detector.get_status()
        
        return {
            'status': 'active' if anomaly_status.get('model_loaded') else 'inactive',
            'model_loaded': anomaly_status.get('model_loaded', False),
            'version': anomaly_status.get('version')
        }
    except Exception as e:
        return {'status': 'error', 'error': str(e)}

async def _check_symbolic_agent_status():
    """Check symbolic reasoning agent status."""
    try:
        symbolic_status = await symbolic_engine.get_status()
        
        return {
            'status': 'active' if symbolic_status.get('rules_loaded') else 'inactive',
            'rules_loaded': symbolic_status.get('rules_loaded', False),
            'inference_count': symbolic_status.get('inference_history_count', 0),
            'version': symbolic_status.get('engine_version')
        }
    except Exception as e:
        return {'status': 'error', 'error': str(e)}
