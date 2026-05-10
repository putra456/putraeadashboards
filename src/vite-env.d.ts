/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_TOKEN: string
  readonly VITE_GITHUB_REPO_OWNER: string
  readonly VITE_GITHUB_REPO_NAME: string
  readonly VITE_GITHUB_FILE_PATH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}