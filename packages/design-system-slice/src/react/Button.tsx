import * as React from 'react';
import { Button as AntButton, ConfigProvider } from 'antd';
import { themeConfig } from '../tokens';
import { expandState } from '../contract';

export type ButtonVariant = 'primary' | 'default' | 'dashed' | 'text' | 'link';
export type ButtonSize = 'small' | 'middle' | 'large';
export type ButtonState = 'default' | 'disabled' | 'loading';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  state?: ButtonState;
  danger?: boolean;
  block?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

/**
 * Button — the React projection of button.contract.json, themed by @aha/design.
 * The contract vocabulary (variant/state) projects onto antd's own props here.
 */
export function Button({
  variant = 'default',
  size = 'middle',
  state = 'default',
  danger = false,
  block = false,
  icon,
  children,
  onClick,
}: ButtonProps): React.ReactElement {
  const { disabled, loading } = expandState(state);
  return (
    <ConfigProvider theme={themeConfig}>
      <AntButton
        type={variant}
        size={size}
        disabled={disabled}
        loading={loading}
        danger={danger}
        block={block}
        icon={icon}
        onClick={onClick}
      >
        {children}
      </AntButton>
    </ConfigProvider>
  );
}

export default Button;
