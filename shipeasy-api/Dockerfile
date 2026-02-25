# Use an official Node.js runtime as the base image
FROM node:22

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy your application code into the container
COPY . .

# Expose a port for your Node.js application (adjust this if needed)
EXPOSE 3000

# Define the command to run your application
CMD [ "node", "index.js" ]
