export class DoublyLinkedListElement<T> {
  constructor(
    public value: T,
    public previous: DoublyLinkedListElement<T> | null = null,
    public next: DoublyLinkedListElement<T> | null = null
  ) {}
}

export class DoublyLinkedList<T> {
  private head: DoublyLinkedListElement<T> | null = null
  private tail: DoublyLinkedListElement<T> | null = null
  private size = 0

  public insertHead(element: T): DoublyLinkedListElement<T> {
    const newHead = new DoublyLinkedListElement(element, null, this.head)
    this.head = newHead

    if (this.size === 0) {
      this.tail = newHead
    }

    if (newHead.next != null) {
      newHead.next.previous = newHead
    }

    this.size++
    return newHead
  }

  public deleteTail(): DoublyLinkedListElement<T> | null {
    if (this.tail == null) {
      return null
    }

    const oldTail = this.tail
    this.delete(this.tail)
    return oldTail
  }

  public delete(element: DoublyLinkedListElement<T>): void {
    // Re-link the nodes to remove element from the list in O(1) time
    if (element.previous != null) {
      element.previous.next = element.next
    }

    if (element.next != null) {
      element.next.previous = element.previous
    }

    if (element === this.head) {
      this.head = element.next
    } else if (element === this.tail) {
      this.tail = element.previous
    }

    this.size--
  }

  public getSize(): number {
    return this.size
  }
}
