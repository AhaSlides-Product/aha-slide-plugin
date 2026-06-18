/**
 * Represents the result of an audio upload.
 */
export interface AudioUploadResult {
  /** The public URL of the uploaded audio file. */
  url: string;
  /** The original file name of the uploaded audio. */
  name: string;
  /** Any additional metadata returned by the upload service. */
  [key: string]: any;
}
