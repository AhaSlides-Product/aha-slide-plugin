import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Icons from "./Icons.vue";

const meta: Meta<typeof Icons> = {
  title: "Showcase/Icons",
  component: Icons,
};

export default meta;
type Story = StoryObj<typeof Icons>;

export const Default: Story = {};
