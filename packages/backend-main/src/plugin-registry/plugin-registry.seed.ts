import type { PluginDescriptor } from './plugin-registry.types';

/**
 * The DURABLE registry: a committed seed served by GET. backend-main has no
 * datastore, so "publishing" a plugin durably = a PR editing this list. The
 * optional POST overlay (see the service) is EPHEMERAL runtime-only.
 *
 * Seeded with the FAB chatbot preview so the presenter install-by-ID flow works
 * end-to-end the moment this ships:
 *   aha-chatbot-app @ fleet/unified-assistant-base -> deploy-fab-preview.yml
 *   -> https://fab.aha-claude-assistant-sandbox.pages.dev
 */
export const REGISTRY_SEED: readonly PluginDescriptor[] = [
  {
    id: 'ai-chatbot',
    kind: 'embed',
    name: 'AI Chatbot (FAB)',
    version: 'fab',
    payload: {
      baseUrl: 'https://fab.aha-claude-assistant-sandbox.pages.dev',
    },
  },
];
