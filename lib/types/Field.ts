export enum FieldType {
  HTML = 'html',
  JSON = 'json',
  STRING = 'string',
  TEXT = 'text',
  NUMERIC = 'numeric',
  DATE = 'date',
  BOOLEAN = 'boolean',
}

interface BaseField {
  id: string
  label: string
  description?: string
  required?: boolean
}

export enum StringType {
  EMAIL = 'email',
  TEXT = 'text',
  URL = 'url',
  PHONE = 'phone',
}

type BooleanField = BaseField & {
  type: FieldType.BOOLEAN
  value?: boolean
}

type NumericField = BaseField & {
  type: FieldType.NUMERIC
  value?: number
}

type StringField = BaseField & {
  type: FieldType.STRING
  stringType?: StringType
  value?: string
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

type DateField = BaseField & {
  type: FieldType.DATE
  value?: string // ISO format
}

export type Field =
  | BooleanField
  | TextField
  | NumericField
  | StringField
  | HtmlField
  | JsonField
  | DateField
