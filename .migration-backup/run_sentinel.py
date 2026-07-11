import os
import subprocess
import time
import sys
import threading
import itertools
from pathlib import Path

class Spinner:
    def __init__(self, message="Loading...", delay=0.1):
        self.message = message
        self.delay = delay
        self.spinner = itertools.cycle(['|', '/', '-', '\\'])
        self.running = False
        self.thread = None

    def spin(self):
        while self.running:
            sys.stdout.write(f"\r{self.message} {next(self.spinner)}")
            sys.stdout.flush()
            time.sleep(self.delay)
        sys.stdout.write("\r" + " " * (len(self.message) + 2) + "\r")
        sys.stdout.flush()

    def __enter__(self):
        self.running = True
        self.thread = threading.Thread(target=self.spin)
        self.thread.start()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.running = False
        if self.thread:
            self.thread.join()

def run_project():
    print("--- STARTING SENTINEL SYSTEM ---")
    
    # Get the project root directory
    root_dir = Path(__file__).parent.absolute()
    backend_path = root_dir / "sentinel-app" / "backend" / "main.py"
    frontend_dir = root_dir / "sentinel-app" / "frontend"
    
    # Check for backend dependencies
    try:
        import fastapi
        import uvicorn
        import fitz
        import easyocr
        import transformers
    except ImportError:
        print("Missing dependencies. Checking for pip...")
        
        # Ensure pip is available
        try:
            import pip
        except ImportError:
            print("Pip not found. Bootstrapping pip...")
            try:
                subprocess.check_call([sys.executable, "-m", "ensurepip", "--default-pip"])
                subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", "pip"])
            except Exception as e:
                print(f"FAILED to bootstrap pip: {e}")
                print("Trying to install without direct pip module...")

        print("Installing required Python packages...")
        try:
            with Spinner("Installing Python dependencies (Torch/Transformers)..."):
                subprocess.check_call([sys.executable, "-m", "pip", "install", "fastapi", "uvicorn", "python-multipart", "pymupdf", "easyocr", "transformers", "torch", "torchvision", "torchaudio"])
        except subprocess.CalledProcessError as e:
            print(f"ERROR: Failed to install Python dependencies: {e}")
            return

    # Start Backend
    print(f"Initializing Neural Core (Backend) at {backend_path}...")
    if not backend_path.exists():
        print(f"ERROR: Backend not found at {backend_path}")
        return

    # Set up environment for backend to find its own modules if needed
    env = os.environ.copy()
    env["PYTHONPATH"] = str(backend_path.parent)
    
    # Use -u for unbuffered output to see logs immediately
    backend_proc = subprocess.Popen([sys.executable, "-u", str(backend_path)], cwd=str(backend_path.parent), env=env)
    
    # Wait a moment for backend to initialize
    time.sleep(2)

    # Start Frontend
    print(f"Launching Command Center (Frontend) in {frontend_dir}...")
    if not frontend_dir.exists():
        print(f"ERROR: Frontend directory not found at {frontend_dir}")
        backend_proc.terminate()
        return

    # Check for node_modules
    if not (frontend_dir / "node_modules").exists():
        print("node_modules not found. Installing frontend dependencies (this may take a while)...")
        try:
            # Use --no-audit and --no-fund to speed up install slightly
            with Spinner("Installing Node dependencies..."):
                subprocess.check_call("npm install --no-audit --no-fund", shell=True, cwd=str(frontend_dir))
        except subprocess.CalledProcessError:
            print("ERROR: Failed to install frontend dependencies.")
            backend_proc.terminate()
            return

    # Use shell=True for npm on Windows
    frontend_env = os.environ.copy()
    frontend_env["NEXT_PUBLIC_API_URL"] = "http://localhost:8000"
    
    # Force PATH to include node_modules/.bin to fix 'next is not recognized'
    bin_path = str(frontend_dir / "node_modules" / ".bin")
    if bin_path not in frontend_env.get("PATH", ""):
        frontend_env["PATH"] = bin_path + os.pathsep + frontend_env.get("PATH", "")

    frontend_proc = subprocess.Popen("npm run dev", shell=True, cwd=str(frontend_dir), env=frontend_env)
    
    with Spinner("Warming up Neural Core & Interface..."):
        time.sleep(5) # Give it a bit more time for Next.js to start
    
    print("\n--- SENTINEL SYSTEM DEPLOYED ---")
    print("Backend: http://localhost:8000")
    print("Frontend: http://localhost:5000")
    print("Press CTRL+C to shutdown.\n")
    
    try:
        while True:
            if backend_proc.poll() is not None:
                print("Backend process exited unexpectedly.")
                break
            if frontend_proc.poll() is not None:
                print("Frontend process exited unexpectedly.")
                break
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down Sentinel...")
    finally:
        # Be more aggressive with termination on Windows
        if sys.platform == "win32":
            subprocess.call(["taskkill", "/F", "/T", "/PID", str(backend_proc.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            # For frontend_proc, since it's shell=True, we might need to kill the process group or children
            subprocess.call(["taskkill", "/F", "/T", "/PID", str(frontend_proc.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        else:
            backend_proc.terminate()
            frontend_proc.terminate()
        print("Sentinel shutdown complete.")

if __name__ == "__main__":
    run_project()
