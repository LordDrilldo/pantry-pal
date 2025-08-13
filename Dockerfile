# === STAGE 1: Build the React Frontend ===
# Use an official Node.js runtime as a parent image for the build stage
FROM node:18-slim as build-stage

# Set the working directory in the container
WORKDIR /app

# Copy the root package.json and package-lock.json
COPY package*.json ./

# Install all dependencies for the frontend
RUN npm install

# Copy the rest of the application's source code
COPY . .

# Build the frontend for production. This creates the /app/dist folder.
RUN npm run build


# === STAGE 2: Setup the Production Node.js Server ===
# Use a fresh, lightweight Node.js image for the final production server
FROM node:18-slim as production-stage

WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/server ./server
COPY --from=build-stage /app/package.json ./package.json

# Go into the server directory to install its specific dependencies
WORKDIR /app/server

# Install only the production dependencies for the backend
RUN npm install --omit=dev

# Go back to the app root
WORKDIR /app

# The server is now configured to serve from the 'dist' folder.
# We also need db.json to be writable by the application.
# The server will run from /app/server/server.js
# The start command is in server/package.json, so we can use that.

# Tell Docker that the container listens on port 3000
EXPOSE 3000

# Define the command to run the app
# This will execute `npm start` inside the /app/server directory
CMD ["npm", "start", "--prefix", "server"]