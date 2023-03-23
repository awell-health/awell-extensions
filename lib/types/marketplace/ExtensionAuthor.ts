export enum AuthorType {
  AWELL = 'Awell',
  HTD = 'HTD',
  EXTERNAL = 'External',
}

interface AwellAuthor {
  authorType: AuthorType.AWELL
}

interface HTDAuthor {
  authorType: AuthorType.HTD
}

interface ExternalAuthor {
  authorType: AuthorType.EXTERNAL
  authorName: string
}

export type Author = AwellAuthor | HTDAuthor | ExternalAuthor
