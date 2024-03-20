# Use the official Node.js 14 image.
FROM node:14

# Set the working directory.
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy local code to the container image.
COPY . ./

# Build the application
RUN npm run build

# Start the application
CMD [ "npm", "start" ]
