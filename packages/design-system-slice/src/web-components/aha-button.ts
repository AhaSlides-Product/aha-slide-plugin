import { LitElement, html, css, unsafeCSS, nothing, type CSSResultGroup } from 'lit';
import { themeToken } from '../tokens';
import { expandState } from '../contract';

export type ButtonVariant = 'primary' | 'default' | 'dashed' | 'text' | 'link';
export type ButtonSize = 'small' | 'middle' | 'large';
export type ButtonState = 'default' | 'disabled' | 'loading';

function asPx(value: string | number): string {
  return typeof value === 'number' ? `${value}px` : String(value);
}

/**
 * Custom properties resolved from the SAME @aha/design source `tokens.ts` feeds
 * the antd tiers, so one @aha/design change re-themes every consumer. The element
 * binds only to these; it never restates a hex or px for a themable value.
 */
export const themeCustomProperties: Readonly<Record<string, string>> = {
  '--aha-color-primary': String(themeToken.colorPrimary),
  '--aha-color-error': String(themeToken.colorError),
  '--aha-color-text-disabled': String(themeToken.colorTextDisabled),
  '--aha-color-bg-fill-disabled': String(themeToken.colorBgFillDisabled),
  '--aha-color-bg-base': String(themeToken.colorBgBase),
  '--aha-border-radius': asPx(themeToken.borderRadius),
  '--aha-font-size': asPx(themeToken.fontSize),
  '--aha-font-family': String(themeToken.fontFamily),
};

const styles: CSSResultGroup = css`
  :host {
    display: inline-block;
  }
  :host([block]) {
    display: block;
  }
  :host([block]) button {
    width: 100%;
  }

  button {
    font-family: var(--aha-font-family);
    font-size: var(--aha-font-size);
    border-radius: var(--aha-border-radius);
    border: 1px solid transparent;
    padding: 6px 16px;
    line-height: 1.5;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: transparent;
    color: var(--aha-color-primary);
    transition: opacity 0.2s ease;
  }

  :host([size='small']) button {
    padding: 2px 8px;
    font-size: calc(var(--aha-font-size) - 2px);
  }
  :host([size='large']) button {
    padding: 8px 20px;
    font-size: calc(var(--aha-font-size) + 2px);
  }

  :host([variant='primary']) button {
    background: var(--aha-color-primary);
    border-color: var(--aha-color-primary);
    color: var(--aha-color-bg-base);
  }
  :host([variant='default']) button {
    border-color: var(--aha-color-primary);
  }
  :host([variant='dashed']) button {
    border-style: dashed;
    border-color: var(--aha-color-primary);
  }
  :host([variant='text']) button,
  :host([variant='link']) button {
    border-color: transparent;
    background: transparent;
  }

  :host([danger]) button {
    color: var(--aha-color-error);
    border-color: var(--aha-color-error);
  }
  :host([danger][variant='primary']) button {
    background: var(--aha-color-error);
    border-color: var(--aha-color-error);
    color: var(--aha-color-bg-base);
  }

  :host([state='disabled']) button {
    color: var(--aha-color-text-disabled);
    background: var(--aha-color-bg-fill-disabled);
    border-color: var(--aha-color-bg-fill-disabled);
    cursor: not-allowed;
  }
  :host([state='loading']) button {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .spinner {
    width: 1em;
    height: 1em;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    display: inline-block;
    animation: aha-spin 0.7s linear infinite;
  }
  @keyframes aha-spin {
    to {
      transform: rotate(360deg);
    }
  }

  slot[name='icon']::slotted(*) {
    display: inline-flex;
  }
`;

/**
 * `<aha-button>` — the framework-agnostic PRIMITIVE tier of button.contract.json.
 * A Lit custom element themed by @aha/design, imported unchanged by React and Vue;
 * it wraps no native component — it IS the primitive the antd wrappers otherwise
 * re-implement per framework. Contract vocabulary reflects to attributes so the
 * host styles each state; `state` reuses the contract's own disabled/loading
 * expansion, keeping the element honest to the single source of truth.
 */
export class AhaButton extends LitElement {
  static styles = styles;

  static properties = {
    variant: { type: String, reflect: true },
    size: { type: String, reflect: true },
    state: { type: String, reflect: true },
    danger: { type: Boolean, reflect: true },
    block: { type: Boolean, reflect: true },
  };

  // `declare` (no class-field initializer) so Lit's reactive accessors are not
  // shadowed; defaults are set in the constructor instead.
  declare variant: ButtonVariant;
  declare size: ButtonSize;
  declare state: ButtonState;
  declare danger: boolean;
  declare block: boolean;

  constructor() {
    super();
    this.variant = 'default';
    this.size = 'middle';
    this.state = 'default';
    this.danger = false;
    this.block = false;
  }

  connectedCallback(): void {
    super.connectedCallback();
    for (const [name, value] of Object.entries(themeCustomProperties)) {
      this.style.setProperty(name, value);
    }
  }

  private onButtonClick(event: Event): void {
    const { disabled, loading } = expandState(this.state);
    if (disabled || loading) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }

  render() {
    const { disabled, loading } = expandState(this.state);
    return html`
      <button
        part="button"
        type="button"
        ?disabled=${disabled}
        aria-busy=${loading ? 'true' : 'false'}
        @click=${this.onButtonClick}
      >
        ${loading
          ? html`<span class="spinner" part="spinner" aria-hidden="true"></span>`
          : nothing}
        <slot name="icon"></slot>
        <slot></slot>
      </button>
    `;
  }
}

if (!customElements.get('aha-button')) {
  customElements.define('aha-button', AhaButton);
}

declare global {
  interface HTMLElementTagNameMap {
    'aha-button': AhaButton;
  }
}
