// Environment matrix. One place that knows about URLs and credentials.
// Select with TEST_ENV=staging (default). Placeholders: {{ENVIRONMENTS}}, {{BASE_URL}}
import 'dotenv/config';
import { resolve } from 'node:path';

type EnvName = 'local' | 'staging' | 'canary' | 'prod';

interface EnvConfig {
  baseURL: string;
  apiBaseURL: string;
}

const MATRIX: Record<EnvName, EnvConfig> = {
  local: { baseURL: 'http://localhost:5173', apiBaseURL: 'http://localhost:3000' },
  staging: { baseURL: '{{BASE_URL_STAGING}}', apiBaseURL: '{{API_BASE_URL_STAGING}}' },
  canary: { baseURL: '{{BASE_URL_CANARY}}', apiBaseURL: '{{API_BASE_URL_CANARY}}' },
  prod: { baseURL: '{{BASE_URL_PROD}}', apiBaseURL: '{{API_BASE_URL_PROD}}' },
};

const name = (process.env.TEST_ENV ?? 'staging') as EnvName;

if (!MATRIX[name]) {
  throw new Error(`Unknown TEST_ENV "${name}". Expected one of: ${Object.keys(MATRIX).join(', ')}`);
}

/** Fail loudly at load time rather than with an unreadable error mid-test. */
function required(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env var ${key}. Copy .env.example to .env and fill it in.`);
  return v;
}

export const ENV = {
  name,
  ...MATRIX[name],
  user: {
    email: required('TEST_USER_EMAIL'),
    password: required('TEST_USER_PASSWORD'),
  },
  // Written by the `setup` project, consumed by the `e2e` project.
  storageStatePath: resolve(__dirname, '../.auth/user.json'),
} as const;
