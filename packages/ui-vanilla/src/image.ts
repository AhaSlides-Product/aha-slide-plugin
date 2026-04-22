/**
 * Represents the result of an image upload.
 */
export interface ImageUploadResult {
  /** The static asset paths. This one should be save on the database, so it can be used to sign the new URL later*/
  path: string;
  /** The public URL of the uploaded image. */
  url: string;
  /** Any additional metadata returned by the upload service. */
  [key: string]: any;
}
