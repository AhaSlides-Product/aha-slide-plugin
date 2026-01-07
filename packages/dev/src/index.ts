import { RequestMessage, ResponseMessage } from '@aha/ui';


/**
 * Fetches slide data from the dev server.
 */
async function handleGetSlideData(payload: any) {
  const { slideId: sid, fields } = payload;
  const attributeKeys = fields?.length > 0 ? `&attributeKeys=${fields.join(',')}` : '';

  const resp = await fetch(`https://presenter.dev.ahaslide.com/api/v2/slides/attributes?slideIds=${sid}${attributeKeys}`, {
    method: 'GET',
    headers: {
      'authorization': `Bearer ${import.meta.env.VITE_AHA_TOKEN}`,
    }
  });

  if (!resp.ok) {
    throw new Error(`API error: ${resp.status} ${resp.statusText}`);
  }

  const data = await resp.json();
  const attributesByType: Record<string, any> = {};
  if (Array.isArray(data)) {
    for (const item of data) {
      attributesByType[item.type] = item.attributes;
    }
  }
  return attributesByType;
}

/**
 * Updates slide attributes on the dev server.
 */
async function handleUpdateSlide(payload: { slideId: string; attributeKey: string, attributeValue: any }) {
  const { slideId: sid, attributeKey, attributeValue } = payload;

  const resp = await fetch(`https://presenter.dev.ahaslide.com/api/v2/slides/${sid}/attributes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${import.meta.env.VITE_AHA_TOKEN}`,
    },
    body: JSON.stringify({
      attributeKey,
      attributeValue
    })
  });

  if (!resp.ok) {
    throw new Error(`API error: ${resp.status} ${resp.statusText}`);
  }

  const responsePayload = await resp.json();
  return responsePayload;
}

/**
 * Map of available command handlers.
 */
const COMMAND_HANDLERS: Record<string, (payload: any) => Promise<any>> = {
  'get-slide-data': handleGetSlideData,
  'update-slide': handleUpdateSlide,
};

/**
 * Initializes development mode polyfill.
 * Listens for postMessage requests and provides mock/API responses.
 */
export function initDev() {
  if (window.parent !== window) {
    console.warn('[@aha/dev] App is running in an iframe, initDev ignored.');
    return;
  }

  console.log('[@aha/dev] Initializing dev polyfill...');

  window.addEventListener('message', async (event: MessageEvent) => {
    const data = event.data as RequestMessage;

    // We only care about requests (objects with id, type, payload and NOT isResponse)
    if (data && typeof data === 'object' && data.id && data.type && !('isResponse' in data)) {
      console.log(`[@aha/dev] Intercepted request "${data.type}":`, data.payload);

      const handler = COMMAND_HANDLERS[data.type];

      if (!handler) {
        console.warn(`[@aha/dev] No handler for request type: ${data.type}`);
        return;
      }

      let responsePayload: any = null;
      let error: string | undefined;

      try {
        responsePayload = await handler(data.payload);
      } catch (e: any) {
        console.error(`[@aha/dev] ${data.type} failed:`, e);
        error = e.message;
      }

      // Send response back to the same window
      const response: ResponseMessage = {
        id: data.id,
        payload: responsePayload,
        error,
        isResponse: true
      };

      window.postMessage(response, '*');
    }
  });
}
