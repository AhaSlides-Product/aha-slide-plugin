import * as React from 'react';
import './aha-button';

/**
 * The intrinsic-element typing React needs to accept `<aha-button>` in JSX. The
 * SAME compiled element the Vue consumer imports — no per-framework wrapper.
 */
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'aha-button': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        variant?: 'primary' | 'default' | 'dashed' | 'text' | 'link';
        size?: 'small' | 'middle' | 'large';
        state?: 'default' | 'disabled' | 'loading';
        danger?: boolean;
        block?: boolean;
      };
    }
  }
}

export function ReactConsumerButton(): React.ReactElement {
  return <aha-button variant="primary">Save changes</aha-button>;
}

export default ReactConsumerButton;
