FROM node:24-alpine

WORKDIR /app

# Copy root node_modules for hoisted dependencies
COPY node_modules ./node_modules

# Copy internal packages that are dependencies
# Note: These are needed because node_modules contains symlinks to them
COPY packages/backend-utils ./packages/backend-utils
COPY apps/sample-slide/backend ./apps/sample-slide/backend

# Copy the actual application package and its build output
COPY packages/backend-main/package.json ./packages/backend-main/
COPY packages/backend-main/dist ./packages/backend-main/dist

WORKDIR /app/packages/backend-main

CMD ["node", "dist/main.js"]
