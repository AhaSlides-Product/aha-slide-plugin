import { type ObjectDirective } from 'vue';

export interface TrackingElement extends HTMLElement {
  _emitActionHandler?: (event: Event) => void;
  _trackingPayload?: any;
}

/**
 * A Vue directive to track click actions and emit them to the parent window.
 * It attaches a click event listener to the element and sends the binding value
 * as a 'track-action' message via postMessage.
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
      window.parent.postMessage({
        type: 'track-action',
        payload: el._trackingPayload
      }, '*');
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
