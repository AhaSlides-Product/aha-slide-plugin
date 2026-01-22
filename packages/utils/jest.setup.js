// Load environment variables from root .env file
const path = require('path');
const dotenv = require('dotenv');

const rootEnvPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: rootEnvPath });
