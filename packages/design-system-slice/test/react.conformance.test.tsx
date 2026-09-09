import { describe, it, expect } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import * as React from 'react';
import { Button } from '../src/react';
import { buttonContract, type EnumProp } from '../src/contract';

const variants = (buttonContract.props.variant as EnumProp).values;
const sizes = (buttonContract.props.size as EnumProp).values;
const states = (buttonContract.props.state as EnumProp).values;

function btn(container: HTMLElement): HTMLButtonElement {
  const el = container.querySelector('button');
  if (!el) throw new Error('no <button> rendered');
  return el as HTMLButtonElement;
}

describe('React Button honours button.contract.json', () => {
  it('supports every declared variant', () => {
    for (const variant of variants) {
      const { container } = render(<Button variant={variant as never}>Go</Button>);
      expect(btn(container)).toBeTruthy();
      cleanup();
    }
  });

  it('supports every declared size', () => {
    for (const size of sizes) {
      const { container } = render(<Button size={size as never}>Go</Button>);
      expect(btn(container)).toBeTruthy();
      cleanup();
    }
  });

  it('supports every declared state, mapping disabled/loading correctly', () => {
    for (const state of states) {
      const { container } = render(<Button state={state as never}>Go</Button>);
      const el = btn(container);
      if (state === 'disabled') expect(el.disabled).toBe(true);
      if (state === 'loading') expect(container.querySelector('.ant-btn-loading')).toBeTruthy();
      if (state === 'default') expect(el.disabled).toBe(false);
      cleanup();
    }
  });

  it('supports the danger flag', () => {
    const { container } = render(<Button danger>Delete</Button>);
    expect(container.querySelector('.ant-btn-dangerous')).toBeTruthy();
    cleanup();
  });

  it('supports the block flag', () => {
    const { container } = render(<Button block>Wide</Button>);
    expect(container.querySelector('.ant-btn-block')).toBeTruthy();
    cleanup();
  });

  it('supports a leading icon', () => {
    const { container } = render(<Button icon={<span data-testid="ic" />}>Go</Button>);
    expect(container.querySelector('[data-testid="ic"]')).toBeTruthy();
    cleanup();
  });
});
