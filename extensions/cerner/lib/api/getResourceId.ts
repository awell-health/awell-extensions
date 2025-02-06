export const getResourceId = (url: string): string | null => {
  // Use regex to match the last part of the URL after the final slash
  const match = url.match(/\/([^/]+)$/)

  // Return the matched ID or null if no match is found
  return match === null ? null : match[1]
}
