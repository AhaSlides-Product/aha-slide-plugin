import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import Button from '../src/vue/Button.vue';
import { buttonContract, type EnumProp } from '../src/contract';

const variants = (buttonContract.props.variant as EnumProp).values;
const sizes = (buttonContract.props.size as EnumProp).values;
const states = (buttonContract.props.state as EnumProp).values;

describe('Vue Button honours button.contract.json', () => {
  it('supports every declared variant', () => {
    for (const variant of variants) {
      const wrapper = mount(Button, { props: { variant: variant as never }, slots: { default: 'Go' } });
      expect(wrapper.find('button').exists()).toBe(true);
      wrapper.unmount();
    }
  });

  it('supports every declared size', () => {
    for (const size of sizes) {
      const wrapper = mount(Button, { props: { size: size as never }, slots: { default: 'Go' } });
      expect(wrapper.find('button').exists()).toBe(true);
      wrapper.unmount();
    }
  });

  it('supports every declared state, mapping disabled/loading correctly', () => {
    for (const state of states) {
      const wrapper = mount(Button, { props: { state: state as never }, slots: { default: 'Go' } });
      const button = wrapper.find('button');
      expect(button.exists()).toBe(true);
      if (state === 'disabled') expect(button.attributes('disabled')).toBeDefined();
      if (state === 'loading') expect(wrapper.find('.ant-btn-loading').exists()).toBe(true);
      if (state === 'default') expect(button.attributes('disabled')).toBeUndefined();
      wrapper.unmount();
    }
  });

  it('supports the danger flag', () => {
    const wrapper = mount(Button, { props: { danger: true }, slots: { default: 'Delete' } });
    expect(wrapper.find('.ant-btn-dangerous').exists()).toBe(true);
    wrapper.unmount();
  });

  it('supports the block flag', () => {
    const wrapper = mount(Button, { props: { block: true }, slots: { default: 'Wide' } });
    expect(wrapper.find('.ant-btn-block').exists()).toBe(true);
    wrapper.unmount();
  });

  it('supports a leading icon slot', () => {
    const wrapper = mount(Button, {
      props: {},
      slots: { default: 'Go', icon: () => h('span', { 'data-testid': 'ic' }) },
    });
    expect(wrapper.find('[data-testid="ic"]').exists()).toBe(true);
    wrapper.unmount();
  });
});
