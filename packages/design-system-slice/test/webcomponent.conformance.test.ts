import { describe, it, expect, afterEach } from 'vitest';
import { AhaButton, themeCustomProperties } from '../src/web-components/aha-button';
import { themeToken } from '../src/tokens';
import { buttonContract, type EnumProp } from '../src/contract';

const variants = (buttonContract.props.variant as EnumProp).values;
const sizes = (buttonContract.props.size as EnumProp).values;
const states = (buttonContract.props.state as EnumProp).values;

async function mount(setup?: (el: AhaButton) => void): Promise<AhaButton> {
  const el = document.createElement('aha-button') as AhaButton;
  el.textContent = 'Go';
  setup?.(el);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function innerButton(el: AhaButton): HTMLButtonElement {
  const button = el.shadowRoot?.querySelector('button');
  if (!button) throw new Error('no <button> rendered in shadow root');
  return button as HTMLButtonElement;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('<aha-button> honours button.contract.json', () => {
  it('is registered as a custom element', () => {
    expect(customElements.get('aha-button')).toBe(AhaButton);
  });

  it('applies the contract defaults', async () => {
    const el = await mount();
    expect(el.variant).toBe((buttonContract.props.variant as EnumProp).default);
    expect(el.size).toBe((buttonContract.props.size as EnumProp).default);
    expect(el.state).toBe((buttonContract.props.state as EnumProp).default);
    expect(el.danger).toBe(false);
    expect(el.block).toBe(false);
  });

  it('reflects every declared variant to an attribute', async () => {
    for (const variant of variants) {
      const el = await mount((e) => (e.variant = variant as never));
      expect(el.getAttribute('variant')).toBe(variant);
      expect(innerButton(el)).toBeTruthy();
      el.remove();
    }
  });

  it('reflects every declared size to an attribute', async () => {
    for (const size of sizes) {
      const el = await mount((e) => (e.size = size as never));
      expect(el.getAttribute('size')).toBe(size);
      el.remove();
    }
  });

  it('reflects the danger and block flags to boolean attributes', async () => {
    const danger = await mount((e) => (e.danger = true));
    expect(danger.hasAttribute('danger')).toBe(true);
    danger.remove();

    const block = await mount((e) => (e.block = true));
    expect(block.hasAttribute('block')).toBe(true);
    block.remove();
  });

  it('maps every declared state to disabled/loading per the contract expansion', async () => {
    for (const state of states) {
      const el = await mount((e) => (e.state = state as never));
      expect(el.getAttribute('state')).toBe(state);
      const button = innerButton(el);
      if (state === 'disabled') expect(button.disabled).toBe(true);
      if (state === 'loading') {
        expect(el.shadowRoot?.querySelector('.spinner')).toBeTruthy();
        expect(button.getAttribute('aria-busy')).toBe('true');
      }
      if (state === 'default') {
        expect(button.disabled).toBe(false);
        expect(el.shadowRoot?.querySelector('.spinner')).toBeNull();
      }
      el.remove();
    }
  });

  it('exposes a default slot for the label and a named icon slot', async () => {
    const el = await mount();
    expect(el.shadowRoot?.querySelector('slot:not([name])')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('slot[name="icon"]')).toBeTruthy();
  });

  it('emits a click when interactive', async () => {
    const el = await mount();
    let clicks = 0;
    el.addEventListener('click', () => (clicks += 1));
    innerButton(el).click();
    expect(clicks).toBe(1);
  });

  it('suppresses the click while loading', async () => {
    const el = await mount((e) => (e.state = 'loading'));
    let clicks = 0;
    el.addEventListener('click', () => (clicks += 1));
    innerButton(el).click();
    expect(clicks).toBe(0);
  });

  it('applies @aha/design token values as custom properties, never a hardcoded literal', async () => {
    const el = await mount();
    expect(el.style.getPropertyValue('--aha-color-primary')).toBe(String(themeToken.colorPrimary));
    expect(el.style.getPropertyValue('--aha-color-error')).toBe(String(themeToken.colorError));
    expect(el.style.getPropertyValue('--aha-color-text-disabled')).toBe(
      String(themeToken.colorTextDisabled),
    );
    expect(el.style.getPropertyValue('--aha-color-bg-fill-disabled')).toBe(
      String(themeToken.colorBgFillDisabled),
    );
    expect(el.style.getPropertyValue('--aha-border-radius')).toBe(`${themeToken.borderRadius}px`);
    expect(el.style.getPropertyValue('--aha-font-size')).toBe(`${themeToken.fontSize}px`);
    expect(el.style.getPropertyValue('--aha-font-family')).toBe(String(themeToken.fontFamily));
  });

  it('resolves every custom property from the live @aha/design token source', () => {
    // The element must never restate a token value; each maps straight from @aha/design.
    expect(themeCustomProperties['--aha-color-primary']).toBe(String(themeToken.colorPrimary));
    expect(themeCustomProperties['--aha-color-error']).toBe(String(themeToken.colorError));
  });
});
