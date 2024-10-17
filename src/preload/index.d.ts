export interface ElectronHandler {
  ipcRenderer: {
    sendMessage(channel: string, ...args: unknown[]): void
    on(channel: string, func: (...args: unknown[]) => void): () => void
    once(channel: string, func: (...args: unknown[]) => void): void
  }
}

declare global {
  interface Window {
    electron: ElectronHandler
  }
}
