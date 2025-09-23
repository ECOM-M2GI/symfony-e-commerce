# =========================================
# Stage 1: Development - Angular Application
# =========================================

# Define the Node.js version to use (Alpine for a small footprint)
ARG NODE_VERSION=22.14.0-alpine

# Set the base image for development
FROM node:${NODE_VERSION} AS prod

# Set the working directory inside the container
WORKDIR /app

# Copy only the dependency files first to optimize Docker caching
COPY package.json package-lock.json ./

# Install dependencies using npm with caching to speed up subsequent builds
RUN --mount=type=cache,target=/root/.npm npm install

# Copy all application source files into the container
COPY . .

# Build the Angular application for production
RUN npm run build -- --configuration production

# =========================================
# Stage 2: Production - Nginx to Serve the Application
# =========================================

FROM nginx:alpine AS runtime

ARG PROJECT_NAME=ebey

# Copy the built Angular application from the previous stage to Nginx's HTML directory
COPY --from=prod /app/dist/${PROJECT_NAME}/browser /usr/share/nginx/html
COPY --from=prod /app/nginx.conf /etc/nginx/nginx.conf

# Expose port 80 to the outside world
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
