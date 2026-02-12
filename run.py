"""
Lead Generation Platform - Backend + Frontend Launcher

Starts both:
1. FastAPI Backend (http://localhost:8000)
2. Next.js Frontend (http://localhost:3000)

Usage:
    python run.py           # Start both services
    npm run dev            # Alternative: run frontend only
    uvicorn app.main:app   # Alternative: run backend only
"""

import subprocess
import sys
import time
import os
import signal
import atexit
import platform

backend_process = None
frontend_process = None


def cleanup_processes():
    """Gracefully terminate both processes"""
    global backend_process, frontend_process
    
    print("\n\n🛑 Shutting down services...")
    
    if backend_process and backend_process.poll() is None:
        print("  • Stopping FastAPI backend...")
        backend_process.terminate()
        try:
            backend_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            backend_process.kill()
    
    if frontend_process and frontend_process.poll() is None:
        print("  • Stopping Next.js frontend...")
        frontend_process.terminate()
        try:
            frontend_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            frontend_process.kill()
    
    print("✅ All services stopped")


def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully"""
    cleanup_processes()
    sys.exit(0)


if __name__ == "__main__":
    # Register cleanup handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    atexit.register(cleanup_processes)
    
    # Get current directory
    project_root = os.getcwd()
    frontend_dir = os.path.join(project_root, "saa-s-dashboard-ui")
    
    print("=" * 70)
    print("🚀 LEAD GENERATION PLATFORM - Starting Services")
    print("=" * 70)
    
    # Check if frontend directory exists
    if not os.path.exists(frontend_dir):
        print("❌ ERROR: saa-s-dashboard-ui/ directory not found!")
        print(f"   Expected at: {frontend_dir}")
        sys.exit(1)
    
    # Check if frontend dependencies are installed
    if not os.path.exists(os.path.join(frontend_dir, "node_modules")):
        print("⚠️  WARNING: Frontend dependencies not installed yet!")
        print("    Run 'cd saa-s-dashboard-ui && npm install' first")
        response = input("\nContinue anyway? (y/n): ").strip().lower()
        if response != 'y':
            sys.exit(0)
    
    # Start FastAPI Backend
    print("\n📌 Starting FastAPI Backend...")
    print("   📍 http://localhost:8000")
    print("   📚 API Docs: http://localhost:8000/docs")
    
    if platform.system() == "Windows":
        # Use shell for Windows command execution
        backend_cmd = f"{sys.executable} -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
        backend_process = subprocess.Popen(
            backend_cmd,
            cwd=project_root,
            shell=True
        )
    else:
        # Use direct Python on Unix-like systems
        backend_process = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "app.main:app",
             "--host", "0.0.0.0", "--port", "8000", "--reload"],
            cwd=project_root
        )
    
    # Wait for backend to start
    time.sleep(3)
    
    if backend_process.poll() is not None:
        print("❌ Backend failed to start!")
        print("   Possible causes:")
        print("   1. Port 8000 already in use - Kill the process or use different port")
        print("   2. Python dependencies not installed - Run: pip install -r requirements.txt")
        print("   3. Google Maps API not configured - Set GOOGLE_MAPS_API_KEY in .env")
        sys.exit(1)
    
    # Start Next.js Frontend
    print("\n📌 Starting Next.js Frontend...")
    print("   📍 http://localhost:3000")
    print("   🎨 Source: saa-s-dashboard-ui/")
    
    # Build command based on platform
    if platform.system() == "Windows":
        # Use shell on Windows to avoid PowerShell execution policy issues
        frontend_cmd = "npm run dev"
        frontend_process = subprocess.Popen(
            frontend_cmd,
            cwd=frontend_dir,
            shell=True
        )
    else:
        # Use direct npm on Unix-like systems
        frontend_process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=frontend_dir
        )
    
    # Wait for frontend to start
    time.sleep(4)
    
    if frontend_process.poll() is not None:
        print("❌ Frontend failed to start!")
        print("   Possible causes:")
        print("   1. npm is not installed - Download from https://nodejs.org/")
        print("   2. node_modules not installed - Run: cd saa-s-dashboard-ui && npm install")
        print("   3. Port 3000 already in use - Kill the process or use different port")
        sys.exit(1)
    
    print("\n" + "=" * 70)
    print("✅ ALL SERVICES STARTED SUCCESSFULLY!")
    print("=" * 70)
    print("\n📋 Available URLs:")
    print("   • Frontend:    http://localhost:3000")
    print("   • Backend:     http://localhost:8000")
    print("   • API Docs:    http://localhost:8000/docs")
    print("   • ReDoc:       http://localhost:8000/redoc")
    print("\n💡 Tips:")
    print("   • Press Ctrl+C to stop all services")
    print("   • Frontend changes auto-reload")
    print("   • Backend changes auto-reload")
    print("   • Check individual terminals for detailed logs")
    print("\n" + "=" * 70 + "\n")
    
    try:
        # Keep both processes running
        while True:
            # Check if either process has crashed
            if backend_process.poll() is not None:
                print("❌ Backend process crashed!")
                cleanup_processes()
                sys.exit(1)
            
            if frontend_process.poll() is not None:
                print("❌ Frontend process crashed!")
                cleanup_processes()
                sys.exit(1)
            
            time.sleep(1)
    
    except KeyboardInterrupt:
        cleanup_processes()
        sys.exit(0)
