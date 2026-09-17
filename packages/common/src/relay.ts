export function getRelaySession({ slideId, slideVersion }: {
  slideId: string | number;
  slideVersion: string | number;
}) {
  // version is in the key so a "Reset result" lands everyone in a fresh relay session
  return `slide-${slideId}-${slideVersion}`
}
