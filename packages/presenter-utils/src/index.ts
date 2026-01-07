import { useRoute } from 'vue-router';
import { execRequest } from '@aha/ui';

export function useSlideUtils() {
  const route = useRoute();

  // 1. Get slideId from path param (:slideId)
  // the value is captured at the time of calling useSlideUtils()
  const slideId = route.params.slideId;

  /**
   * 2. updateSlide function
   * Handles the logic for sending updates to the backend/store
   * @param {Record<string, any>} updatedData - The new slide content
   */
  const updateSlide = async (updatedData: Record<string, any>) => {
    return execRequest('update-slide', {
      slideId,
      ...updatedData
    });
  };

  /**
   * 3. getSlideData function
   * Fetches slide data from the backend/store
   */
  const getSlideData = async () => {
    return execRequest('get-slide-data', {
      slideId
    });
  };

  // return the utilities
  return {
    updateSlide,
    getSlideData,
    slideId // returned for reference as per user request
  };
}
