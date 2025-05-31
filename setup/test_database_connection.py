#!/usr/bin/env python3
"""
REAL Neon PostgreSQL connection test with detailed diagnostics
"""
import os
import sys
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("database-test")

def test_database_connection():
    """Test database connection with detailed diagnostics"""
    print("\n🗄️ TESTING DATABASE CONNECTION")
    print("=" * 50)
    
    # Check environment variable
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        logger.error("❌ DATABASE_URL environment variable not set")
        logger.error("Set it with: export DATABASE_URL=postgresql://user:pass@host/dbname")
        return False
    
    try:
        import psycopg2
        from psycopg2.extras import RealDictCursor
        
        # Mask the password in the URL for logging
        masked_url = database_url
        if "@" in database_url and ":" in database_url:
            parts = database_url.split("@")
            credentials = parts[0].split("://")[1]
            if ":" in credentials:
                username = credentials.split(":")[0]
                masked_url = database_url.replace(credentials, f"{username}:****")
        
        logger.info(f"🔌 Connecting to database: {masked_url}")
        
        # Connect to database
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Test basic query
        logger.info("🔍 Testing basic query...")
        cursor.execute("SELECT current_database() as db, current_timestamp as time, version() as version;")
        result = cursor.fetchone()
        
        logger.info(f"✅ Connected to database: {result['db']}")
        logger.info(f"📅 Server time: {result['time']}")
        logger.info(f"📊 PostgreSQL version: {result['version']}")
        
        # Check for mntrk schema
        logger.info("🔍 Checking for mntrk schema...")
        cursor.execute("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'mntrk';")
        schema_exists = cursor.fetchone() is not None
        
        if schema_exists:
            logger.info("✅ MNTRK schema exists")
            
            # Check tables in mntrk schema
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'mntrk'
                ORDER BY table_name;
            """)
            
            tables = cursor.fetchall()
            if tables:
                table_list = [table['table_name'] for table in tables]
                logger.info(f"📋 Found {len(table_list)} tables in mntrk schema:")
                for table in table_list:
                    logger.info(f"   - {table}")
            else:
                logger.warning("⚠️ No tables found in mntrk schema")
        else:
            logger.warning("⚠️ MNTRK schema does not exist - will need to be created")
        
        # Test write permission with a temporary table
        logger.info("🔍 Testing write permissions...")
        try:
            # Create a temporary table
            cursor.execute("""
                CREATE TEMPORARY TABLE sovereign_test (
                    id SERIAL PRIMARY KEY,
                    test_name VARCHAR(100),
                    timestamp TIMESTAMP DEFAULT NOW()
                );
            """)
            
            # Insert a test record
            cursor.execute("""
                INSERT INTO sovereign_test (test_name)
                VALUES ('connection_test')
                RETURNING id;
            """)
            
            test_id = cursor.fetchone()['id']
            logger.info(f"✅ Write test successful (ID: {test_id})")
            
            # Clean up
            cursor.execute("DROP TABLE sovereign_test;")
            conn.commit()
            
        except Exception as e:
            conn.rollback()
            logger.error(f"❌ Write permission test failed: {e}")
        
        # Close connection
        cursor.close()
        conn.close()
        
        logger.info("\n✅ DATABASE CONNECTION TEST SUCCESSFUL")
        return True
        
    except ImportError as e:
        logger.error(f"❌ Missing psycopg2 package: {e}")
        logger.error("Install with: pip install psycopg2-binary")
        return False
    except psycopg2.OperationalError as e:
        logger.error(f"❌ Database connection failed: {e}")
        
        # Provide more specific error guidance
        error_str = str(e)
        if "could not connect to server" in error_str:
            logger.error("🔍 Check if the database server is running and accessible")
        elif "password authentication failed" in error_str:
            logger.error("🔍 Check your username and password")
        elif "database" in error_str and "does not exist" in error_str:
            logger.error("🔍 The specified database does not exist")
        
        return False
    except Exception as e:
        logger.error(f"❌ Database test failed: {e}")
        logger.error(f"Error type: {type(e).__name__}")
        return False

def main():
    """Run database connection test"""
    print("\n🛡️ SOVEREIGN GRID - DATABASE CONNECTION TEST")
    print("=" * 50)
    
    if test_database_connection():
        print("\n🗄️ DATABASE CONNECTION SUCCESSFUL - SOVEREIGN GRID READY")
        return True
    else:
        print("\n❌ DATABASE CONNECTION FAILED - CHECK CONFIGURATION")
        return False

if __name__ == "__main__":
    main()
