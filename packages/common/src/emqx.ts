export function getBucket(bucketName: string, { presentationId, slideId, slideVersion }: {
  presentationId: string | number;
  slideId: string | number;
  slideVersion: string | number;
}) {
  // can't use presentationId as bucket name 
  // since it changes after a reset 
  return `s${slideId}-v${slideVersion}/${bucketName}`
}