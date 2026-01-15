import { type ObjectDirective } from 'vue';

export interface TrackingElement extends HTMLElement {
  _emitActionHandler?: (event: Event) => void;
  _trackingPayload?: any;
}

/**
 * A Vue directive to track click actions and emit them to the parent window.
 * It attaches a click event listener to the element and sends the binding value
 * via zoid prop `trackGA4AndMixpanel`.
 * 
 * @example
 * ```html
 * <button v-emit-action="{ category: 'ui', action: 'click', label: 'submit' }">
 *   Submit
 * </button>
 * ```
 */
export const vEmitAction: ObjectDirective<TrackingElement, any> = {
  mounted(el, binding) {
    el._trackingPayload = binding.value;
    el._emitActionHandler = () => {
      const xprops = (window as any).xprops;
      if (xprops && typeof xprops.trackGA4AndMixpanel === 'function') {
        xprops.trackGA4AndMixpanel(el._trackingPayload);
      }
    };
    el.addEventListener('click', el._emitActionHandler);
  },
  updated(el, binding) {
    el._trackingPayload = binding.value;
  },
  unmounted(el) {
    if (el._emitActionHandler) {
      el.removeEventListener('click', el._emitActionHandler);
      delete el._emitActionHandler;
      delete el._trackingPayload;
    }
  }
};
