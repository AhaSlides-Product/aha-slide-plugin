import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import type { StorybookConfig } from "@storybook/vue3-vite";
import vue from "@vitejs/plugin-vue";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [getAbsolutePath("@storybook/addon-links"), getAbsolutePath("@storybook/addon-docs")],

  framework: {
    name: getAbsolutePath("@storybook/vue3-vite"),
    options: {},
  },

  async viteFinal(config: any) {
    config.plugins = config.plugins || [];

    // Ensure vue plugin is present
    if (!config.plugins.some((p: any) => p && p.name === "vite:vue")) {
      config.plugins.push(vue());
    }

    const tailwindcss = (await import("@tailwindcss/vite")).default;
    config.plugins.push(tailwindcss());

    const { ahaViteIconPlugin } = await import("@aha/ui/vite.config.icon");
    config.plugins.push(ahaViteIconPlugin);
    return config;
  }
};
export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
