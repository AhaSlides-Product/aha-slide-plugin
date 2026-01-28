FROM node:24-alpine

WORKDIR /app

# Copy root node_modules for hoisted dependencies
COPY --chown=node:node node_modules ./node_modules

# Copy internal packages that are dependencies
# Note: These are needed because node_modules contains symlinks to them
COPY --chown=node:node packages/backend-utils ./packages/backend-utils
COPY --chown=node:node packages/common ./packages/common
COPY --chown=node:node apps/ ./apps/

# Copy the actual application package and its build output
COPY --chown=node:node packages/backend-main/package.json ./packages/backend-main/
COPY --chown=node:node packages/backend-main/dist ./packages/backend-main/dist

USER node

WORKDIR /app/packages/backend-main
EXPOSE 3000

CMD ["node", "dist/main.js"]
