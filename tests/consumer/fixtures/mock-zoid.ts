import { vi } from 'vitest';

/**
 * Mock zoid implementation for testing Zoid components
 */
export const mockZoid = {
  create: vi.fn((config: any) => {
    return class MockZoidComponent extends HTMLElement {
      static tag = config.tag;
      static props = config.props;
      
      connectedCallback() {
        // Mock implementation
      }
    };
  }),
};
