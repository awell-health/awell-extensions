import { DoublyLinkedList, type DoublyLinkedListElement } from './linkedList'

interface KV<T> {
  key: string
  value: T
}

export class LRU<T> {
  private readonly map = new Map<string, DoublyLinkedListElement<KV<T>>>()

  private readonly list = new DoublyLinkedList<KV<T>>()

  /**
   * LRU cache, the least used element gets evicted when capacity is reached
   * @param maxEntries maximum capacity. If set to -1, the cache has no limit and won't evict keys. Defaults to -1.
   */
  constructor(readonly maxEntries = -1) {}

  public get(key: string): T | null {
    // We remove the element from the list first, this also re-links the nodes
    const element = this.delete(key)

    // If nothing was removed, the key didn't exist
    if (element == null) {
      return null
    }

    // Move element to the top of the list and update map with new reference
    const newElement = this.list.insertHead(element.value)
    this.map.set(key, newElement)

    return element.value.value
  }

  public set(key: string, value: T): void {
    // Add new element to list and store reference in map
    const newElement = this.list.insertHead({ key, value })
    this.map.set(key, newElement)

    // Evict last element if we reached capacity
    if (this.maxEntries !== -1 && this.list.getSize() > this.maxEntries) {
      const removedTail = this.list.deleteTail()
      if (removedTail != null) {
        // Remove reference from the map
        this.map.delete(removedTail.value.key)
      }
    }
  }

  public delete(key: string): DoublyLinkedListElement<KV<T>> | null {
    const element = this.map.get(key)

    if (element == null) {
      return null
    }

    this.list.delete(element)

    // Remove reference from the map
    this.map.delete(element.value.key)

    return element
  }
}
