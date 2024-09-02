FROM node:alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies and remove cache to reduce image size
RUN npm install --only=production && npm cache clean --force

# Copy the rest of the application files to the working directory
COPY . .

# Expose a port 
EXPOSE 3000

# Define the command to start backend application
CMD ["node", "backend.js"]