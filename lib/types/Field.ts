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
}

type NumericField = BaseField & {
  type: FieldType.NUMERIC
}

type StringField = BaseField & {
  type: FieldType.STRING
  stringType?: StringType
}

type HtmlField = BaseField & {
  type: FieldType.HTML
}

type JsonField = BaseField & {
  type: FieldType.JSON
}

type TextField = BaseField & {
  type: FieldType.TEXT
}

type DateField = BaseField & {
  type: FieldType.DATE
}

export type Field =
  | BooleanField
  | TextField
  | NumericField
  | StringField
  | HtmlField
  | JsonField
  | DateField
