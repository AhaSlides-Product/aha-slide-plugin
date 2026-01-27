export function getBucket(bucketName: string, { presentationId, slideId, slideVersion }: {
  presentationId: string | number;
  slideId: string | number;
  slideVersion: number;
}) {
  return `p${presentationId}-s${slideId}-v${slideVersion}-${bucketName}`
}