/** Remove *highlight* markers before plain-text animation */
export function stripHighlightMarkers(text: string): string {
  return text.replace(/\*([^*]+)\*/g, "$1");
}
