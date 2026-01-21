import type { Meta, StoryObj } from "@storybook/vue3-vite";
import IconsV2 from "./IconsV2.vue";

const meta: Meta<typeof IconsV2> = {
  title: "Showcase/IconsV2",
  component: IconsV2,
};

export default meta;
type Story = StoryObj<typeof IconsV2>;

export const Default: Story = {};
