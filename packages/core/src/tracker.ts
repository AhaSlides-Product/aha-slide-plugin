import type { TrackerOptions, Tracker } from './types'

const ACTION_MAP: Record<string, string> = {
  click: 'click',
  mouseenter: 'hover',
  dblclick: 'double_click',
  view: 'view',
  focus: 'focus',
  blur: 'blur',
  change: 'change',
  submit: 'submit',
}

function buildEventName(action: string, name?: string, otherInfo?: string): string {
  return [action, name, otherInfo].filter(Boolean).join('_')
}

export function createTracker(options: TrackerOptions): Tracker {
  const { element, events = ['click'], name, otherInfo } = options
  let customProps = { ...(options.customProps || {}) }

  const cleanups: (() => void)[] = []
  let observer: IntersectionObserver | null = null

  function track(action: string) {
    const eventName = buildEventName(action, name, otherInfo)
    const xprops = (window as any).xprops
    xprops?.trackGA4AndMixpanel?.(eventName, { eventAction: eventName, ...customProps })
  }

  for (const event of events) {
    const mappedAction = ACTION_MAP[event]
    if (!mappedAction) continue

    if (event === 'view') {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              track(mappedAction)
            }
          }
        },
        { threshold: 0.1 },
      )
      observer.observe(element)
    } else {
      const handler = () => track(mappedAction)
      element.addEventListener(event, handler)
      cleanups.push(() => element.removeEventListener(event, handler))
    }
  }

  return {
    updateProps(props: Record<string, any>) {
      customProps = { ...customProps, ...props }
    },
    destroy() {
      cleanups.forEach((fn) => fn())
      cleanups.length = 0
      if (observer) {
        observer.disconnect()
        observer = null
      }
    },
  }
}
