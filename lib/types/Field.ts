export enum FieldType {
  HTML = 'html',
  JSON = 'json',
  STRING = 'string',
  TEXT = 'text',
  NUMERIC = 'numeric',
}

interface BaseField {
  id: string
  label: string
  description?: string
  required?: boolean
  options?: Record<string, any>
}

export enum StringType {
  EMAIL = 'email',
  TEXT = 'text',
  URL = 'url',
}

type NumericField = BaseField & {
  type: FieldType.NUMERIC
  value?: number
}

type StringField = BaseField & {
  type: FieldType.STRING
  value?: string
  stringType?: StringType
}

type HtmlField = BaseField & {
  type: FieldType.HTML
  value?: string
}

type JsonField = BaseField & {
  type: FieldType.JSON
  value?: string
}

type TextField = BaseField & {
  type: FieldType.TEXT
  value?: string
}

export type Field =
  | TextField
  | NumericField
  | StringField
  | HtmlField
  | JsonField
