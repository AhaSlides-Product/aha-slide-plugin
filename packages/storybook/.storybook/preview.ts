import type { Preview } from "@storybook/vue3-vite";
import { setup } from "@storybook/vue3-vite";
import Antd from "ant-design-vue";

import '@aha/ui/ahaslides-vars.css'
import "./style.css";

setup((app) => {
  app.use(Antd);
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
