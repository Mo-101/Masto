"""
MNTRK Sovereign Observatory - System Diagnostic Tool
Comprehensive system health and connectivity verification
"""

import asyncio
import aiohttp
import logging
import os
import sys
from datetime import datetime
import json

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("Sovereign-Diagnostic")

class SovereignDiagnostic:
    """Comprehensive diagnostic tool for MNTRK Sovereign Observatory."""
    
    def __init__(self):
        self.api_base_url = os.getenv('API_BASE_URL', 'http://localhost:8080')
        self.results = {}
        
    async def run_full_diagnostic(self):
        """Run complete system diagnostic."""
        logger.info("🔍 Starting MNTRK Sovereign Observatory Diagnostic")
        logger.info("=" * 60)
        
        # Test API connectivity
        await self._test_api_connectivity()
        
        # Test database connections
        await self._test_database_connections()
        
        # Test AI services
        await self._test_ai_services()
        
        # Test ML pipeline
        await self._test_ml_pipeline()
        
        # Test edge connectivity
        await self._test_edge_connectivity()
        
        # Generate diagnostic report
        await self._generate_diagnostic_report()
        
        return self.results
    
    async def _test_api_connectivity(self):
        """Test main API connectivity."""
        logger.info("🌐 Testing API Connectivity...")
        
        try:
            async with aiohttp.ClientSession() as session:
                # Test health endpoint
                async with session.get(f"{self.api_base_url}/health") as response:
                    if response.status == 200:
                        health_data = await response.json()
                        self.results['api_health'] = {
                            "status": "healthy",
                            "response_time": "< 1s",
                            "service": health_data.get('service', 'unknown')
                        }
                        logger.info("✅ API Health Check: PASSED")
                    else:
                        self.results['api_health'] = {
                            "status": "unhealthy",
                            "error": f"HTTP {response.status}"
                        }
                        logger.error("❌ API Health Check: FAILED")
                
                # Test system status
                async with session.get(f"{self.api_base_url}/api/system/status") as response:
                    if response.status == 200:
                        status_data = await response.json()
                        self.results['system_status'] = status_data
                        logger.info("✅ System Status: OPERATIONAL")
                    else:
                        self.results['system_status'] = {"status": "error"}
                        logger.error("❌ System Status: FAILED")
                        
        except Exception as e:
            self.results['api_health'] = {"status": "error", "error": str(e)}
            logger.error(f"❌ API Connectivity Test Failed: {e}")
    
    async def _test_database_connections(self):
        """Test database connectivity."""
        logger.info("🗄️ Testing Database Connections...")
        
        try:
            # Test Firestore connection
            from shared.database import get_db
            try:
                db = get_db()
                # Simple test query
                test_collection = db.collection('system_test')
                test_doc = test_collection.document('diagnostic_test')
                test_doc.set({"test": True, "timestamp": datetime.now()})
                
                self.results['firestore'] = {"status": "connected", "test": "write_successful"}
                logger.info("✅ Firestore Connection: CONNECTED")
            except Exception as e:
                self.results['firestore'] = {"status": "error", "error": str(e)}
                logger.error(f"❌ Firestore Connection: FAILED - {e}")
            
            # Test Neon PostgreSQL connection
            try:
                from shared.neon_database import get_neon_sql
                sql = get_neon_sql()
                result = sql("SELECT 1 as test")
                
                if result and result[0][0] == 1:
                    self.results['neon_db'] = {"status": "connected", "test": "query_successful"}
                    logger.info("✅ Neon PostgreSQL: CONNECTED")
                else:
                    self.results['neon_db'] = {"status": "error", "error": "query_failed"}
                    logger.error("❌ Neon PostgreSQL: QUERY FAILED")
                    
            except Exception as e:
                self.results['neon_db'] = {"status": "error", "error": str(e)}
                logger.error(f"❌ Neon PostgreSQL: FAILED - {e}")
                
        except Exception as e:
            logger.error(f"❌ Database Test Failed: {e}")
    
    async def _test_ai_services(self):
        """Test AI service connectivity."""
        logger.info("🤖 Testing AI Services...")
        
        try:
            async with aiohttp.ClientSession() as session:
                # Test DeepSeek AI health
                async with session.get(f"{self.api_base_url}/api/ai/health") as response:
                    if response.status == 200:
                        ai_health = await response.json()
                        self.results['deepseek_ai'] = ai_health
                        
                        if ai_health.get('connected'):
                            logger.info("✅ DeepSeek AI: CONNECTED")
                        else:
                            logger.warning("⚠️ DeepSeek AI: NOT CONNECTED")
                    else:
                        self.results['deepseek_ai'] = {"status": "error", "http_status": response.status}
                        logger.error("❌ DeepSeek AI Health Check: FAILED")
                        
        except Exception as e:
            self.results['deepseek_ai'] = {"status": "error", "error": str(e)}
            logger.error(f"❌ AI Services Test Failed: {e}")
    
    async def _test_ml_pipeline(self):
        """Test ML pipeline functionality."""
        logger.info("🧠 Testing ML Pipeline...")
        
        try:
            # Test ML pipeline status
            from ml_pipeline.pipeline import get_pipeline
            pipeline = await get_pipeline()
            status = await pipeline.get_model_status()
            
            self.results['ml_pipeline'] = status
            
            if status.get('models_loaded'):
                logger.info("✅ ML Pipeline: MODELS LOADED")
            else:
                logger.warning("⚠️ ML Pipeline: MODELS NOT LOADED")
                
        except Exception as e:
            self.results['ml_pipeline'] = {"status": "error", "error": str(e)}
            logger.error(f"❌ ML Pipeline Test Failed: {e}")
    
    async def _test_edge_connectivity(self):
        """Test edge device connectivity."""
        logger.info("📡 Testing Edge Connectivity...")
        
        try:
            # Test edge inference endpoint
            edge_url = os.getenv('EDGE_API_URL', 'http://localhost:8081')
            
            async with aiohttp.ClientSession() as session:
                try:
                    async with session.get(f"{edge_url}/health", timeout=5) as response:
                        if response.status == 200:
                            edge_health = await response.json()
                            self.results['edge_devices'] = {
                                "status": "connected",
                                "health": edge_health
                            }
                            logger.info("✅ Edge Devices: CONNECTED")
                        else:
                            self.results['edge_devices'] = {
                                "status": "error",
                                "http_status": response.status
                            }
                            logger.error("❌ Edge Devices: CONNECTION FAILED")
                            
                except asyncio.TimeoutError:
                    self.results['edge_devices'] = {
                        "status": "timeout",
                        "message": "Edge service not responding"
                    }
                    logger.warning("⚠️ Edge Devices: TIMEOUT")
                    
        except Exception as e:
            self.results['edge_devices'] = {"status": "error", "error": str(e)}
            logger.error(f"❌ Edge Connectivity Test Failed: {e}")
    
    async def _generate_diagnostic_report(self):
        """Generate comprehensive diagnostic report."""
        logger.info("📊 Generating Diagnostic Report...")
        
        # Calculate overall system health
        total_tests = len(self.results)
        passed_tests = 0
        
        for component, result in self.results.items():
            if isinstance(result, dict):
                status = result.get('status', 'unknown')
                if status in ['healthy', 'connected', 'operational']:
                    passed_tests += 1
                elif 'models_loaded' in result and result['models_loaded']:
                    passed_tests += 1
        
        health_percentage = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        # Determine overall status
        if health_percentage >= 90:
            overall_status = "EXCELLENT"
            status_emoji = "🟢"
        elif health_percentage >= 70:
            overall_status = "GOOD"
            status_emoji = "🟡"
        elif health_percentage >= 50:
            overall_status = "DEGRADED"
            status_emoji = "🟠"
        else:
            overall_status = "CRITICAL"
            status_emoji = "🔴"
        
        # Generate report
        report = {
            "diagnostic_timestamp": datetime.now().isoformat(),
            "overall_status": overall_status,
            "health_percentage": round(health_percentage, 1),
            "tests_passed": passed_tests,
            "total_tests": total_tests,
            "component_results": self.results
        }
        
        # Save report to file
        report_filename = f"diagnostic_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(f"logs/{report_filename}", 'w') as f:
            json.dump(report, f, indent=2)
        
        # Display summary
        logger.info("=" * 60)
        logger.info(f"{status_emoji} MNTRK Sovereign Observatory - System Health: {overall_status}")
        logger.info(f"📊 Overall Health: {health_percentage:.1f}% ({passed_tests}/{total_tests} tests passed)")
        logger.info(f"📄 Detailed report saved: logs/{report_filename}")
        logger.info("=" * 60)
        
        # Display component status
        for component, result in self.results.items():
            if isinstance(result, dict):
                status = result.get('status', 'unknown')
                if status in ['healthy', 'connected']:
                    logger.info(f"✅ {component.upper()}: {status.upper()}")
                elif status == 'error':
                    logger.info(f"❌ {component.upper()}: ERROR")
                else:
                    logger.info(f"⚠️ {component.upper()}: {status.upper()}")
        
        self.results['diagnostic_summary'] = report

async def main():
    """Run diagnostic tool."""
    diagnostic = SovereignDiagnostic()
    results = await diagnostic.run_full_diagnostic()
    
    # Exit with appropriate code
    health_percentage = results.get('diagnostic_summary', {}).get('health_percentage', 0)
    
    if health_percentage >= 70:
        sys.exit(0)  # Success
    else:
        sys.exit(1)  # Failure

if __name__ == "__main__":
    asyncio.run(main())
