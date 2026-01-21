import type { Meta, StoryObj } from "@storybook/vue3";
import AntDesign from "./AntDesign.vue";

const meta: Meta<typeof AntDesign> = {
  title: "Showcase/AntDesign",
  component: AntDesign,
};

export default meta;
type Story = StoryObj<typeof AntDesign>;

export const Default: Story = {};
