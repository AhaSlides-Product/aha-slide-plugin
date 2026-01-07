import { useRoute } from 'vue-router';
import { execRequest } from '@aha/ui';

/**
 * A composable that provides utilities for interacting with slide data.
 * Automatically extracts the `slideId` from the current route parameters.
 * 
 * @returns An object containing `updateSlide`, `getSlideData`, and the `slideId`.
 */
export function useSlideUtils() {
  const route = useRoute();

  // 1. Get slideId from path param (:slideId)
  // the value is captured at the time of calling useSlideUtils()
  const slideId = route.params.slideId;

  /**
   * 2. updateSlide function
   * Handles the logic for sending updates to the backend/store
   * @param {attributeKey: string, attributeValue: any} updatedData - The new slide content
   */
  const updateSlide = async (updatedData: { attributeKey: string, attributeValue: any }) => {
    return execRequest('update-slide', {
      slideId,
      ...updatedData
    });
  };

  /**
   * 3. getSlideData function
   * Fetches slide data from the backend/store
   */
  const getSlideData = async (fields: string[]) => {
    return execRequest('get-slide-data', {
      slideId,
      fields
    });
  };

  // return the utilities
  return {
    updateSlide,
    getSlideData,
    slideId // returned for reference as per user request
  };
}
