import type { Meta, StoryObj } from "@storybook/vue3-vite";
import IconsV1 from "./IconsV1.vue";

const meta: Meta<typeof IconsV1> = {
  title: "Showcase/IconsV1",
  component: IconsV1,
};

export default meta;
type Story = StoryObj<typeof IconsV1>;

export const Default: Story = {};
