# Pantry Pal - AI Recipe Assistant

An intelligent food tracker that helps you manage your pantry, reduce food waste, and discover new recipes with the power of Gemini. Track your items, get expiration alerts, and let AI suggest what you can cook next.

This is a full-stack application with a React frontend and a Node.js/Express backend.

## Setup & Running the Application

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Google Gemini API Key](https://ai.google.dev/pricing)

### 1. Backend Setup

The backend is an Express server that handles user authentication, data persistence, and securely calls the Gemini API.

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `server` directory by copying the example file:
    ```bash
    cp ../.env.example .env
    ```
4.  Edit the `server/.env` file and add your `GEMINI_API_KEY` and a long, random string for `JWT_SECRET`.

5.  Start the backend server:
    ```bash
    npm start
    ```
    The server will be running on `http://localhost:3000`.

### 2. Frontend Setup

The frontend is a React application built with Vite.

1.  In a **new terminal window**, navigate to the project's root directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the frontend development server:
    ```bash
    npm run dev
    ```
    The frontend will be running on `http://localhost:5173`. It is configured to proxy API requests to the backend server.

4.  Open your browser and go to `http://localhost:5173` to use the application.

### 3. Building for Production

1.  From the root directory, build the React frontend:
    ```bash
    npm run build
    ```
    This will create a `dist` folder in the root directory.

2.  The Node.js server is pre-configured to serve the static files from the `dist` folder. Simply start the backend server to run the production build:
    ```bash
    cd server
    npm start
    ```
    Now, accessing `http://localhost:3000` will serve the complete, production-ready application.