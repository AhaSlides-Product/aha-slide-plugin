import { useRoute } from 'vue-router';
import { execRequest } from '@aha/ui';

/**
 * A composable that provides utilities for audience interactions with slides.
 * Automatically extracts the `slideId` from the current route parameters.
 * 
 * @returns An object containing `submitAnswer`, `getSlideData`, and the `slideId`.
 */
export function useAudience() {
  const route = useRoute();

  /** 
   * The unique identifier of the slide, extracted from the route parameter `:slideId`.
   */
  const slideId = route.params.slideId;

  /**
   * Submits an answer for the current slide.
   * 
   * @param payload - The answer data to submit.
   * @returns A promise that resolves to the submission result.
   */
  const submitAnswer = async (payload: any) => {
    return execRequest('submit-answer', {
      slideId,
      ...payload
    });
  };

  /**
   * Fetches data for the current slide.
   * 
   * @param fields - The list of field names to retrieve.
   * @returns A promise that resolves to the requested slide data.
   */
  const getSlideData = async (fields: string[]) => {
    return execRequest('get-slide-data', {
      slideId,
      fields
    });
  };

  return {
    submitAnswer,
    getSlideData,
    slideId
  };
}
