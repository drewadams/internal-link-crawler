export function stripAnchorsAndParamsFromURLString(url: string) {
  return url.replace(/(#|\?).+$/gim, "");
}
