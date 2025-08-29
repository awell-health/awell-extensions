
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_BASIC_AUTH?: string
  readonly ALLOWED_HOST?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
