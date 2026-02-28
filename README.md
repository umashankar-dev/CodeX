# CodeX

CodeX is a full-stack online code execution platform. It leverages **Judge0** for secure, sandboxed code compilation and execution, **MongoDB** for database management, and a Node.js-based backend **(Express)** and **React** frontend.

## Demo

##  Tech Stack
* **Frontend:** React/Vite
* **Backend:** Node.js (Express)
* **Database:** MongoDB
* **Execution Engine:** Judge0 (v1.13.1)
* **Infrastructure:** Docker & Docker Compose

##  Prerequisites

Ensure your system (Ubuntu/Debian recommended) has the following installed:
* [Node.js & npm](https://nodejs.org/)
* [MongoDB](https://www.mongodb.com/docs/manual/administration/install-community/)
* [Docker & Docker Compose](https://docs.docker.com/engine/install/)

**Install PM2 globally** (Used to manage the backend process):
```bash
sudo npm install -g pm2
```

##  Getting Started

Follow these steps to set up the project locally.

### 1. Clone the Repository
```bash
git clone [https://github.com/umashankar-dev/CodeX.git](https://github.com/umashankar-dev/CodeX.git)
cd CodeX
```
### 2. Install Dependencies

Install the required packages for both the frontend and backend.

```bash
# Install backend dependencies
cd codeX-backend
npm install
cd ..

# Install frontend dependencies
cd codeX-frontend
npm install
cd ..
```
### 3. Environment Configuration

Create a .env file in the codeX-backend directory to store your environment variables:

```bash
cd codeX-backend
touch .env
```
Add the following fields to your newly created .env file (replace the JWT_SECRET with a secure string of your choice):

```bash
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/codex
JWT_SECRET="....."
JUDGE0_API_URL=http://localhost:2358
```
### 4. Set Up Judge0

Download and configure the Judge0 execution engine.

```bash
wget [https://github.com/judge0/judge0/releases/download/v1.13.1/judge0-v1.13.1.zip](https://github.com/judge0/judge0/releases/download/v1.13.1/judge0-v1.13.1.zip)
unzip judge0-v1.13.1.zip
```
---
## Running the Application

To run the application locally, start the required services in the following order. You will need separate terminal windows for the frontend, backend, and infrastructure.

### 1. Start System Services
```bash
sudo systemctl start mongod
sudo systemctl start docker
```
### 2. Start Judge0
```bash
cd judge0-v1.13.1
docker-compose up -d db redis
docker-compose up -d
cd ..
```
### 3. Start the Backend (Using PM2)
```bash
cd codeX-backend/
pm2 start server.js --name "codex-backend"
```
### 4. Start the Frontend
```bash
cd codeX-frontend/
npm run dev
```
The application should now be accessible at http://localhost:5173 .

## Troubleshooting

Docker Port Conflicts (e.g., Port 2358 in use) If Docker throws an error because a port is already allocated (Judge0 typically uses 2358), use this quick fix to clear the port and restart your containers:
```bash
# 1. Find the process ID (PID) using the port
sudo lsof -i :2358

# 2. Kill the process (Replace <PID> with your actual PID from the command above)
sudo kill -9 <PID>

# 3. Bring down the stuck containers
docker-compose down
```
After running these, start Judge0 again.


