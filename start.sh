#!/bin/bash
# start.sh

# Start backend
cd backend
# Activate virtual environment if you have one
source env/bin/activate  # For Unix/Linux
# OR: venv\Scripts\activate  # For Windows
python main.py &
BACKEND_PID=$!

# Start frontend
cd ../frontend
bun run dev --host &
FRONTEND_PID=$!

# Handle graceful shutdown
trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM
wait