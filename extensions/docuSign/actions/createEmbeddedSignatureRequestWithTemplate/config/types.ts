export interface DocuSignError {
  response: {
    status: number
    body: Record<string, string>
    text: string
  }
}

export const instanceOfDocuSignError = (obj: any): obj is DocuSignError => {
  return 'response' in obj && 'body' in obj.response && 'text' in obj.response
}
