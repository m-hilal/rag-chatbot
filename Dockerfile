# Use an official Node.js runtime as a parent image (consider matching your project's Node version)
# Using Alpine Linux for a smaller image size
FROM node:20-alpine AS development

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
# Use package-lock.json for npm
COPY package*.json ./

# Install app dependencies
# Use --only=production if you don't need devDependencies in the final image
# But we need them for the build step
RUN npm install

# Copy application source code
COPY . .

# Build the application
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy built artifacts from the development stage
COPY --from=development /usr/src/app/dist ./dist

# Expose the port the app runs on
# Defaulting to 3000, ensure this matches your app's configuration or .env file
EXPOSE 3000

# Define the command to run the application
# This runs the built JavaScript code directly with Node
CMD ["node", "dist/main"] 