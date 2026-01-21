import type { Preview } from "@storybook/vue3-vite";
import { setup } from "@storybook/vue3-vite";
import Antd from "ant-design-vue";
import AhaIcon from "@aha/ui/AhaIcon.vue";

import '@aha/ui/ahaslides-vars.css'
import "./style.css";

setup((app) => {
  app.use(Antd);
  app.component("aha-icon", AhaIcon);
});

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
