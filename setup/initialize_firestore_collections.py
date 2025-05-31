#!/usr/bin/env python3
"""
SOVEREIGN GRID: Initialize Firestore Collections
Creates all necessary collections and indexes for the MNTRK system
"""

import os
import sys
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

def initialize_collections():
    """Initialize all Firestore collections for MNTRK"""
    
    print("🔥 SOVEREIGN GRID: Initializing Firestore Collections")
    print("=" * 60)
    
    try:
        # Initialize Firebase
        cred = credentials.Certificate("firebase-credentials.json")
        app = firebase_admin.initialize_app(cred)
        db = firestore.client()
        
        # Collection schemas
        collections = {
            'detection_patterns': {
                'description': 'Wildlife detection patterns and observations',
                'sample_doc': {
                    'latitude': 45.5231,
                    'longitude': -122.6765,
                    'species': 'example_species',
                    'confidence_score': 0.95,
                    'detection_timestamp': firestore.SERVER_TIMESTAMP,
                    'image_url': 'gs://bucket/path/to/image.jpg',
                    'environmental_context': {
                        'temperature': 22.5,
                        'humidity': 65.0,
                        'weather': 'clear'
                    },
                    'created_at': firestore.SERVER_TIMESTAMP
                }
            },
            'habitat_analyses': {
                'description': 'Habitat suitability analyses and predictions',
                'sample_doc': {
                    'latitude': 45.5231,
                    'longitude': -122.6765,
                    'suitability_score': 0.87,
                    'habitat_type': 'forest',
                    'environmental_factors': {
                        'elevation': 1200,
                        'vegetation_density': 0.8,
                        'water_proximity': 500
                    },
                    'analysis_timestamp': firestore.SERVER_TIMESTAMP,
                    'created_at': firestore.SERVER_TIMESTAMP
                }
            },
            'ai_predictions': {
                'description': 'AI model predictions and results',
                'sample_doc': {
                    'prediction_type': 'movement_prediction',
                    'input_data': {
                        'species': 'example_species',
                        'current_location': {'lat': 45.5231, 'lng': -122.6765},
                        'environmental_data': {}
                    },
                    'prediction_result': {
                        'predicted_locations': [],
                        'confidence_score': 0.92,
                        'time_horizon': '24h'
                    },
                    'model_version': 'v1.0',
                    'prediction_timestamp': firestore.SERVER_TIMESTAMP,
                    'created_at': firestore.SERVER_TIMESTAMP
                }
            },
            'users': {
                'description': 'User profiles and authentication data',
                'sample_doc': {
                    'email': 'user@example.com',
                    'display_name': 'Example User',
                    'role': 'researcher',
                    'permissions': ['read', 'write'],
                    'last_login': firestore.SERVER_TIMESTAMP,
                    'created_at': firestore.SERVER_TIMESTAMP
                }
            },
            'system_status': {
                'description': 'System health and operational status',
                'sample_doc': {
                    'status': 'operational',
                    'last_health_check': firestore.SERVER_TIMESTAMP,
                    'active_models': ['habitat_predictor', 'detection_classifier'],
                    'system_metrics': {
                        'cpu_usage': 45.2,
                        'memory_usage': 67.8,
                        'disk_usage': 23.1
                    },
                    'created_at': firestore.SERVER_TIMESTAMP
                }
            },
            'training_jobs': {
                'description': 'ML model training job status and results',
                'sample_doc': {
                    'job_id': 'training_job_001',
                    'model_type': 'habitat_predictor',
                    'status': 'completed',
                    'start_time': firestore.SERVER_TIMESTAMP,
                    'end_time': firestore.SERVER_TIMESTAMP,
                    'metrics': {
                        'accuracy': 0.94,
                        'loss': 0.12,
                        'f1_score': 0.91
                    },
                    'created_at': firestore.SERVER_TIMESTAMP
                }
            }
        }
        
        # Create collections with sample documents
        for collection_name, config in collections.items():
            print(f"\n📁 Creating collection: {collection_name}")
            print(f"   Description: {config['description']}")
            
            # Create sample document
            doc_ref = db.collection(collection_name).document('_sample')
            doc_ref.set(config['sample_doc'])
            
            print(f"✅ Collection '{collection_name}' initialized with sample document")
        
        # Create system initialization document
        system_init = {
            'initialized_at': firestore.SERVER_TIMESTAMP,
            'version': '1.0.0',
            'collections_created': list(collections.keys()),
            'status': 'SOVEREIGN_GRID_INITIALIZED'
        }
        
        db.collection('system_status').document('initialization').set(system_init)
        
        print("\n🛡️ SOVEREIGN GRID FIRESTORE: FULLY INITIALIZED")
        print(f"✅ Created {len(collections)} collections")
        print("✅ Sample documents created for testing")
        print("✅ System initialization logged")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to initialize Firestore collections: {e}")
        return False

if __name__ == "__main__":
    if initialize_collections():
        print("\n🚀 Firestore ready for Sovereign Grid operations")
        sys.exit(0)
    else:
        print("\n❌ Fix Firestore initialization issues")
        sys.exit(1)
