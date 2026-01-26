export function getBucket({ presentationId, slideId, slideVersion, name }: {
  presentationId: string;
  slideId: string;
  slideVersion: number;
  name: string;
}) {
  return `p${presentationId}-s${slideId}-v${slideVersion}-${name}`
}