export enum ExtensionActionFieldType {
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
  type: ExtensionActionFieldType.NUMERIC
  value?: number
}

type StringField = BaseField & {
  type: ExtensionActionFieldType.STRING
  value?: string
  stringType?: StringType
}

type HtmlField = BaseField & {
  type: ExtensionActionFieldType.HTML
  value?: string
}

type JsonField = BaseField & {
  type: ExtensionActionFieldType.JSON
  value?: string
}

type TextField = BaseField & {
  type: ExtensionActionFieldType.TEXT
  value?: string
}

export type ExtensionActionField =
  | TextField
  | NumericField
  | StringField
  | HtmlField
  | JsonField

export type PluginActionFieldValue = NonNullable<ExtensionActionField['value']>

type NumericFieldWithValue = NumericField &
  Required<Pick<NumericField, 'value'>>
type StringFieldWithValue = StringField & Required<Pick<StringField, 'value'>>
type HtmlFieldWithValue = HtmlField & Required<Pick<HtmlField, 'value'>>
type JsonFieldWithValue = JsonField & Required<Pick<JsonField, 'value'>>
type TextFieldWithValue = TextField & Required<Pick<TextField, 'value'>>

export type ExtensionActionFieldWithWithValue =
  | NumericFieldWithValue
  | StringFieldWithValue
  | HtmlFieldWithValue
  | JsonFieldWithValue
  | TextFieldWithValue
