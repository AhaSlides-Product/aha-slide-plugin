import type { Meta, StoryObj } from "@storybook/vue3";
import AhaIcon from "@aha/ui/AhaIcon.vue";

const meta: Meta<typeof AhaIcon> = {
  title: "Components/AhaIcon",
  component: AhaIcon,
  tags: ["autodocs"],
  argTypes: {
    icon: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof AhaIcon>;

export const Default: Story = {
  args: {
    icon: "home",
  },
};
