export function getBucket({ presentationId, slideId, slideVersion, name }: {
  presentationId: string | number;
  slideId: string | number;
  slideVersion: number;
  name: string;
}) {
  return `p${presentationId}-s${slideId}-v${slideVersion}-${name}`
}