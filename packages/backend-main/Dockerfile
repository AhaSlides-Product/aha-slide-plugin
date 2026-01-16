FROM node:24-alpine

WORKDIR /app

# Copy dependencies
# Note: Since this is a monorepo with hoisted dependencies, 
# you should ensure the necessary node_modules are present in the build context.
# You might need to copy the root node_modules here before building.
COPY node_modules ./node_modules

# Copy built application
# We copy the contents of dist to the root of the app directory
COPY dist .

CMD ["node", "main.js"]
