#!/usr/bin/env python3
"""
🛡️ SOVEREIGN GRID DIAGNOSTIC UTILITY
Comprehensive system verification for all critical components
"""
import os
import sys
import json
import time
import logging
from datetime import datetime
import traceback

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("sovereign-diagnostic")

# ASCII Art
SOVEREIGN_BANNER = """
╔════════════════════════════════════════════════════════════╗
║        🛡️ SOVEREIGN GRID DIAGNOSTIC UTILITY               ║
║           COMPREHENSIVE SYSTEM VERIFICATION                ║
╚════════════════════════════════════════════════════════════╝
"""

class SovereignDiagnostic:
    """Comprehensive diagnostic utility for Sovereign Grid"""
    
    def __init__(self):
        """Initialize the diagnostic utility"""
        self.start_time = time.time()
        self.results = {
            "environment": {"status": "pending", "details": {}},
            "database": {"status": "pending", "details": {}},
            "firebase": {"status": "pending", "details": {}},
            "schema": {"status": "pending", "details": {}},
            "dependencies": {"status": "pending", "details": {}}
        }
        
        print(SOVEREIGN_BANNER)
        logger.info("🛡️ Initializing Sovereign Grid Diagnostic Utility")
        logger.info(f"🕒 Start Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
    def run_all_tests(self):
        """Run all diagnostic tests"""
        try:
            self.check_environment()
            self.check_dependencies()
            self.check_database()
            self.check_firebase()
            self.check_schema()
            self.print_summary()
            return self.results
        except Exception as e:
            logger.error(f"❌ Critical error in diagnostic: {str(e)}")
            logger.error(traceback.format_exc())
            return {"status": "error", "message": str(e)}
    
    def check_environment(self):
        """Check environment variables and system configuration"""
        logger.info("🔍 Checking environment variables...")
        
        # Critical environment variables
        critical_vars = ["DATABASE_URL", "FIREBASE_CREDENTIALS"]
        optional_vars = ["DEEPSEEK_API_KEY", "POSTGRES_PASSWORD", "POSTGRES_USER"]
        
        # Check critical variables
        missing_vars = []
        for var in critical_vars:
            value = os.environ.get(var)
            if not value:
                missing_vars.append(var)
                self.results["environment"]["details"][var] = "❌ Missing"
            else:
                # Mask sensitive values
                masked_value = value[:5] + "..." + value[-5:] if len(value) > 10 else "***"
                self.results["environment"]["details"][var] = f"✅ Set ({masked_value})"
        
        # Check optional variables
        for var in optional_vars:
            value = os.environ.get(var)
            if not value:
                self.results["environment"]["details"][var] = "⚠️ Not set (optional)"
            else:
                self.results["environment"]["details"][var] = "✅ Set"
        
        # Check Python version
        python_version = sys.version.split()[0]
        self.results["environment"]["details"]["python_version"] = f"Python {python_version}"
        
        # Set status
        if missing_vars:
            self.results["environment"]["status"] = "error"
            logger.error(f"❌ Missing critical environment variables: {', '.join(missing_vars)}")
        else:
            self.results["environment"]["status"] = "success"
            logger.info("✅ Environment variables check passed")
    
    def check_dependencies(self):
        """Check required Python dependencies"""
        logger.info("📦 Checking Python dependencies...")
        
        required_packages = [
            "psycopg2", "firebase_admin", "flask", "connexion", 
            "sqlalchemy", "requests", "numpy", "pandas"
        ]
        
        missing_packages = []
        installed_packages = {}
        
        for package in required_packages:
            try:
                module = __import__(package)
                version = getattr(module, "__version__", "unknown")
                installed_packages[package] = version
                self.results["dependencies"]["details"][package] = f"✅ {version}"
            except ImportError:
                missing_packages.append(package)
                self.results["dependencies"]["details"][package] = "❌ Not installed"
        
        if missing_packages:
            self.results["dependencies"]["status"] = "error"
            logger.error(f"❌ Missing dependencies: {', '.join(missing_packages)}")
            logger.error("📝 Install missing packages with: pip install " + " ".join(missing_packages))
        else:
            self.results["dependencies"]["status"] = "success"
            logger.info("✅ All required dependencies are installed")
    
    def check_database(self):
        """Check database connection"""
        logger.info("🗄️ Testing database connection...")
        
        database_url = os.environ.get("DATABASE_URL")
        if not database_url:
            self.results["database"]["status"] = "error"
            self.results["database"]["details"]["connection"] = "❌ DATABASE_URL not set"
            logger.error("❌ DATABASE_URL environment variable not set")
            return
        
        try:
            import psycopg2
            from psycopg2.extras import RealDictCursor
            
            # Connect to database
            conn = psycopg2.connect(database_url)
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            # Test query
            cursor.execute("SELECT current_database() as db, current_timestamp as time, version() as version;")
            result = cursor.fetchone()
            
            self.results["database"]["details"]["database"] = result["db"]
            self.results["database"]["details"]["server_time"] = str(result["time"])
            self.results["database"]["details"]["version"] = result["version"]
            self.results["database"]["details"]["connection"] = "✅ Connected successfully"
            
            # Check for mntrk schema
            cursor.execute("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'mntrk';")
            if cursor.fetchone():
                self.results["database"]["details"]["mntrk_schema"] = "✅ Exists"
            else:
                self.results["database"]["details"]["mntrk_schema"] = "⚠️ Does not exist"
            
            # Close connection
            cursor.close()
            conn.close()
            
            self.results["database"]["status"] = "success"
            logger.info(f"✅ Successfully connected to database: {result['db']}")
            
        except Exception as e:
            self.results["database"]["status"] = "error"
            self.results["database"]["details"]["connection"] = f"❌ Connection failed: {str(e)}"
            logger.error(f"❌ Database connection failed: {str(e)}")
    
    def check_firebase(self):
        """Check Firebase connection"""
        logger.info("🔥 Testing Firebase connection...")
        
        firebase_creds = os.environ.get("FIREBASE_CREDENTIALS")
        if not firebase_creds:
            self.results["firebase"]["status"] = "error"
            self.results["firebase"]["details"]["connection"] = "❌ FIREBASE_CREDENTIALS not set"
            logger.error("❌ FIREBASE_CREDENTIALS environment variable not set")
            return
        
        try:
            import firebase_admin
            from firebase_admin import credentials, firestore
            
            # Load credentials
            if os.path.exists(firebase_creds):
                cred = credentials.Certificate(firebase_creds)
                self.results["firebase"]["details"]["credentials_type"] = "File path"
            else:
                # Parse JSON string
                try:
                    cred_dict = json.loads(firebase_creds)
                    cred = credentials.Certificate(cred_dict)
                    self.results["firebase"]["details"]["credentials_type"] = "JSON string"
                except json.JSONDecodeError:
                    self.results["firebase"]["status"] = "error"
                    self.results["firebase"]["details"]["connection"] = "❌ Invalid JSON in FIREBASE_CREDENTIALS"
                    logger.error("❌ Invalid JSON in FIREBASE_CREDENTIALS")
                    return
            
            # Initialize Firebase
            try:
                firebase_admin.get_app()
                logger.info("Firebase app already initialized")
            except ValueError:
                firebase_admin.initialize_app(cred)
            
            # Get Firestore client
            db = firestore.client()
            
            # Test write
            test_doc = {
                'status': 'diagnostic_test',
                'timestamp': firestore.SERVER_TIMESTAMP,
                'test_id': f"diagnostic-{int(time.time())}"
            }
            
            doc_ref = db.collection('system_tests').add(test_doc)
            self.results["firebase"]["details"]["write_test"] = f"✅ Document created: {doc_ref[1].id}"
            
            # Test read
            docs = db.collection('system_tests').limit(1).stream()
            doc_exists = False
            for doc in docs:
                doc_exists = True
                self.results["firebase"]["details"]["read_test"] = f"✅ Document read: {doc.id}"
                break
            
            if not doc_exists:
                self.results["firebase"]["details"]["read_test"] = "⚠️ No documents found to read"
            
            # Get project info
            project_id = cred.project_id
            self.results["firebase"]["details"]["project_id"] = project_id
            
            self.results["firebase"]["status"] = "success"
            logger.info(f"✅ Successfully connected to Firebase project: {project_id}")
            
        except Exception as e:
            self.results["firebase"]["status"] = "error"
            self.results["firebase"]["details"]["connection"] = f"❌ Connection failed: {str(e)}"
            logger.error(f"❌ Firebase connection failed: {str(e)}")
    
    def check_schema(self):
        """Check database schema"""
        logger.info("📊 Checking database schema...")
        
        if self.results["database"]["status"] != "success":
            self.results["schema"]["status"] = "skipped"
            self.results["schema"]["details"]["reason"] = "Database connection failed"
            logger.warning("⚠️ Skipping schema check due to database connection failure")
            return
        
        try:
            import psycopg2
            
            database_url = os.environ.get("DATABASE_URL")
            conn = psycopg2.connect(database_url)
            cursor = conn.cursor()
            
            # Check if mntrk schema exists
            cursor.execute("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'mntrk';")
            if not cursor.fetchone():
                self.results["schema"]["status"] = "warning"
                self.results["schema"]["details"]["mntrk_schema"] = "⚠️ Schema does not exist"
                logger.warning("⚠️ MNTRK schema does not exist")
                
                # Offer to create schema
                logger.info("📝 Run setup/create_neon_schema.py to create the schema")
                return
            
            # Check tables in mntrk schema
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'mntrk'
                ORDER BY table_name;
            """)
            
            tables = cursor.fetchall()
            if not tables:
                self.results["schema"]["status"] = "warning"
                self.results["schema"]["details"]["tables"] = "⚠️ No tables found in mntrk schema"
                logger.warning("⚠️ No tables found in mntrk schema")
                return
            
            # List tables
            table_list = [table[0] for table in tables]
            self.results["schema"]["details"]["tables"] = f"✅ Found {len(table_list)} tables"
            
            # Check for required tables
            required_tables = [
                "detection_patterns", "habitat_analyses", "training_data", 
                "model_registry", "environmental_data", "outbreak_alerts"
            ]
            
            missing_tables = [table for table in required_tables if table not in table_list]
            
            if missing_tables:
                self.results["schema"]["status"] = "warning"
                self.results["schema"]["details"]["missing_tables"] = f"⚠️ Missing tables: {', '.join(missing_tables)}"
                logger.warning(f"⚠️ Missing required tables: {', '.join(missing_tables)}")
            else:
                self.results["schema"]["status"] = "success"
                self.results["schema"]["details"]["required_tables"] = "✅ All required tables exist"
                logger.info("✅ All required database tables exist")
            
            # Close connection
            cursor.close()
            conn.close()
            
        except Exception as e:
            self.results["schema"]["status"] = "error"
            self.results["schema"]["details"]["error"] = f"❌ Schema check failed: {str(e)}"
            logger.error(f"❌ Schema check failed: {str(e)}")
    
    def print_summary(self):
        """Print diagnostic summary"""
        elapsed_time = time.time() - self.start_time
        
        print("\n" + "=" * 80)
        print(f"🛡️ SOVEREIGN GRID DIAGNOSTIC SUMMARY (completed in {elapsed_time:.2f}s)")
        print("=" * 80)
        
        # Count statuses
        status_counts = {"success": 0, "warning": 0, "error": 0, "pending": 0, "skipped": 0}
        for component, data in self.results.items():
            status = data["status"]
            status_counts[status] = status_counts.get(status, 0) + 1
        
        # Print overall status
        if status_counts["error"] > 0:
            overall_status = "❌ CRITICAL ISSUES DETECTED"
        elif status_counts["warning"] > 0:
            overall_status = "⚠️ WARNINGS DETECTED"
        else:
            overall_status = "✅ ALL SYSTEMS OPERATIONAL"
        
        print(f"\nOVERALL STATUS: {overall_status}")
        print(f"Success: {status_counts['success']} | Warnings: {status_counts['warning']} | Errors: {status_counts['error']}")
        
        # Print component statuses
        print("\nCOMPONENT STATUS:")
        for component, data in self.results.items():
            status = data["status"]
            if status == "success":
                status_icon = "✅"
            elif status == "warning":
                status_icon = "⚠️"
            elif status == "error":
                status_icon = "❌"
            elif status == "skipped":
                status_icon = "⏭️"
            else:
                status_icon = "❓"
            
            print(f"{status_icon} {component.upper()}: {status}")
        
        # Print recommendations
        print("\nRECOMMENDATIONS:")
        if self.results["environment"]["status"] == "error":
            print("❌ Set missing environment variables")
        
        if self.results["dependencies"]["status"] == "error":
            missing = [pkg for pkg, status in self.results["dependencies"]["details"].items() if "❌" in status]
            print(f"❌ Install missing packages: pip install {' '.join(missing)}")
        
        if self.results["database"]["status"] == "error":
            print("❌ Fix database connection issues")
        
        if self.results["firebase"]["status"] == "error":
            print("❌ Fix Firebase credentials")
        
        if self.results["schema"]["status"] in ["warning", "error"]:
            print("⚠️ Run setup/create_neon_schema.py to create or fix database schema")
        
        print("\n" + "=" * 80)
        print(f"🛡️ SOVEREIGN GRID DIAGNOSTIC COMPLETE - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 80 + "\n")

def main():
    """Run the diagnostic utility"""
    diagnostic = SovereignDiagnostic()
    diagnostic.run_all_tests()

if __name__ == "__main__":
    main()
