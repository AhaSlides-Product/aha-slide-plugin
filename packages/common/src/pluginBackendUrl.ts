/**
 * Compute a Cloudflare Workers backend URL for a group plugin.
 *
 * Per design: each group plugin's backend is deployed as its own Worker
 * on the configured subdomain (declared in the group's aha-plugin-group.json).
 * Plugin name and folder name are required to match by convention.
 */
export function getPluginBackendUrl(pluginName: string, subdomain: string): string {
  return `https://${pluginName}.${subdomain}.workers.dev`;
}
