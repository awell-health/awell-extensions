/**
 * Elation returns up to 100 results in a single query
 */
export interface ElationCollection<T> {
  count: number
  next: null | string
  previous: null | string
  results: T[]
}
