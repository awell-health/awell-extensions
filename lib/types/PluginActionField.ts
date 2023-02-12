export enum PluginActionFieldType {
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
  type: PluginActionFieldType.NUMERIC
  value?: number
}

type StringField = BaseField & {
  type: PluginActionFieldType.STRING
  value?: string
  stringType?: StringType
}

type HtmlField = BaseField & {
  type: PluginActionFieldType.HTML
  value?: string
}

type JsonField = BaseField & {
  type: PluginActionFieldType.JSON
  value?: string
}

type TextField = BaseField & {
  type: PluginActionFieldType.TEXT
  value?: string
}

export type PluginActionField =
  | TextField
  | NumericField
  | StringField
  | HtmlField
  | JsonField

export type PluginActionFieldValue = NonNullable<PluginActionField['value']>

type NumericFieldWithValue = NumericField &
  Required<Pick<NumericField, 'value'>>
type StringFieldWithValue = StringField & Required<Pick<StringField, 'value'>>
type HtmlFieldWithValue = HtmlField & Required<Pick<HtmlField, 'value'>>
type JsonFieldWithValue = JsonField & Required<Pick<JsonField, 'value'>>
type TextFieldWithValue = TextField & Required<Pick<TextField, 'value'>>

export type PluginActionFieldWithWithValue =
  | NumericFieldWithValue
  | StringFieldWithValue
  | HtmlFieldWithValue
  | JsonFieldWithValue
  | TextFieldWithValue
