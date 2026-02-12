import { DirectiveBinding, VNode, ObjectDirective, Plugin, App } from 'vue'
import { get as lodashGet, snakeCase } from 'lodash-es'
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

// Huey note: This is a copy of the ported version of v-emit-action directive
// without any dependency on vuex plugin
/**
 * Vue 3 Directive for tracking user actions with Mixpanel
 * 
 * Usage:
 *   <button v-aha-emit-action>Click me</button>
 *   <div v-aha-emit-action.view>Track when visible</div>
 * 
 * The directive will track user interactions and send events to Mixpanel.
 * Supported events: click, mouseenter, dblclick, focus, blur, change, submit
 */

const CLICK_EVENT = 'click'
const HOVER_EVENT = 'mouseenter'
const DOUBLE_CLICK_EVENT = 'dblclick'
const FOCUS_EVENT = 'focus'
const BLUR_EVENT = 'blur'
const CHANGE_EVENT = 'change'
const FORM_SUBMIT_EVENT = 'submit'

const SUPPORTED_EVENTS = [
    CLICK_EVENT,
    HOVER_EVENT,
    DOUBLE_CLICK_EVENT,
    FOCUS_EVENT,
    BLUR_EVENT,
    CHANGE_EVENT,
    FORM_SUBMIT_EVENT,
] as const

const EVENT_ACTIONS: Record<string, string> = {
    click: 'click',
    mouseenter: 'hover',
    dblclick: 'double_click',
    view: 'view',
    focus: 'focus',
    blur: 'blur',
    change: 'change',
    submit: 'submit',
}

const ANONYMOUS_ELEMENT = 'anonymous'

type SupportedEvent = typeof SUPPORTED_EVENTS[number]

interface ExtendedHTMLElement extends HTMLElement {
    [key: string]: any
    showInViewObserver?: IntersectionObserver
}

function _getCallbackKey(event: string): string {
    return `aha-emit-action-${event}-callback`
}

function getUserInput(eventTarget: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): any {
    // Handle checkbox inputs
    if ((eventTarget as HTMLInputElement).type === 'checkbox') {
        return (eventTarget as HTMLInputElement).checked
    }

    // Handle radio inputs
    if ((eventTarget as HTMLInputElement).type === 'radio') {
        return (eventTarget as HTMLInputElement).checked ? eventTarget.value : null
    }

    // Handle select elements
    if (eventTarget.tagName === 'SELECT') {
        return eventTarget.value
    }

    // Handle file inputs
    if ((eventTarget as HTMLInputElement).type === 'file') {
        return (eventTarget as HTMLInputElement).files
    }

    // Handle number inputs
    if ((eventTarget as HTMLInputElement).type === 'number') {
        return (eventTarget as HTMLInputElement).valueAsNumber
    }

    // Handle date inputs
    if ((eventTarget as HTMLInputElement).type === 'date') {
        return (eventTarget as HTMLInputElement).valueAsDate
    }

    // Default case for text, textarea, and other input types
    return eventTarget.value
}

function _getObjectName(vnode: VNode): string {
    // In Vue 3, props are accessed differently
    const nameFromAttr = lodashGet(vnode, 'props.name', '')
    const nameFromComponent = lodashGet(vnode, 'type.name', '') || lodashGet(vnode, 'type.__name', '')
    const nameFromFirstChild = lodashGet(vnode, 'el.firstElementChild.name', '')

    if (!nameFromAttr && !nameFromComponent && !nameFromFirstChild) {
        return ANONYMOUS_ELEMENT
    }

    const name = nameFromAttr || nameFromComponent || nameFromFirstChild
    return snakeCase(name as string)
}

function _getOtherInfo(vnode: VNode): string {
    return snakeCase(lodashGet(vnode, 'props.aha-other-info', '') || lodashGet(vnode, 'props.ahaOtherInfo', ''))
}

function _getCustomProps(binding: DirectiveBinding): any {
    return binding.value
}

function _getTrackingEventName(vnode: VNode, event: string): string {
    const action = EVENT_ACTIONS[event] || 'undefined_action'
    const objectName = _getObjectName(vnode)
    const otherInfo = _getOtherInfo(vnode)

    // Follow new standard for tracking event name
    // https://ahaslides.atlassian.net/wiki/spaces/AT/pages/826834947/Event+Tracking+-+Naming+Guideline+2024
    let args = [action, objectName, otherInfo]
    args = args.filter((arg) => arg)
    return args.join('_')
}

function trackUserAction(eventName: string, vnode: VNode, binding: DirectiveBinding): void {
    const trackingEventName = _getTrackingEventName(vnode, eventName)
    const customProps = _getCustomProps(binding)

    const xprops = (window as any).xprops;
    if (xprops && typeof xprops.trackGA4AndMixpanel === 'function') {
      xprops.trackGA4AndMixpanel(trackingEventName, {
        eventAction: trackingEventName,
        ...customProps
      });
    }
}

export const emitActionDirective: ObjectDirective = {
    mounted(el: ExtendedHTMLElement, binding: DirectiveBinding, vnode: VNode) {
        // If the view modifier is present, use IntersectionObserver API
        if (binding.modifiers?.view) {
            const _callback = (entries: IntersectionObserverEntry[]) => {
                entries.forEach((entry) => {
                    // Workaround for the case when the element is inside a modal
                    // Because it is put inside v-portals, the IntersectionObserver never triggers
                    const isModal = entry.target.classList.contains('v-portal')
                    if (!entry.isIntersecting && !isModal) return

                    trackUserAction('view', vnode, binding)
                })
            }

            const showInViewObserver = new IntersectionObserver(_callback, {
                root: null, // Use the viewport as the root
                rootMargin: '0px', // No margin around the root
                threshold: 0.1, // 10% of the element must be visible to trigger the callback
            })

            showInViewObserver.observe(el)
            el.showInViewObserver = showInViewObserver
            return
        }

        // Setup event listeners for supported events
        SUPPORTED_EVENTS.forEach((eventName: SupportedEvent) => {
            function callback(e: Event) {
                if (eventName === HOVER_EVENT && e.target !== el) return

                // When there's a change in the input/textarea,
                // we add e.target.value to binding.value.user_input
                if (eventName === CHANGE_EVENT && e.target) {
                    const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
                    if (target.value !== undefined) {
                        binding.value = {
                            ...binding.value,
                            user_input: getUserInput(target)
                        }
                    }
                }

                trackUserAction(eventName, vnode, binding)
            }

            el.addEventListener(eventName, callback, true)
            el[_getCallbackKey(eventName)] = callback
        })
    },

    unmounted(el: ExtendedHTMLElement, binding: DirectiveBinding) {
        // Clean up IntersectionObserver if view modifier was used
        if (binding.modifiers?.view && el.showInViewObserver) {
            const observer = el.showInViewObserver
            observer.unobserve(el)
            observer.disconnect()
            return
        }

        // Remove all event listeners
        SUPPORTED_EVENTS.forEach((event: SupportedEvent) => {
            const callback = el[_getCallbackKey(event)]
            if (callback) {
                el.removeEventListener(event, callback, true)
                delete el[_getCallbackKey(event)]
            }
        })
    },
}


/**
 * Vue 3 Plugin to register the emit-action directive
 * 
 * Usage in main.ts:
 *   import emitActionPlugin from '@/directives/emit-action.plugin'
 *   app.use(emitActionPlugin)
 * 
 * Then use in components:
 *   <button v-aha-emit-action>Click me</button>
 */
export const emitActionPlugin: Plugin = {
    install(app: App) {
        app.directive('aha-emit-action', emitActionDirective)
    },
}
