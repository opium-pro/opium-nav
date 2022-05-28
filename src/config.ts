import { getPathFromUrl } from './utils'

export const config = {
  isBrowser: !!(window?.location && window?.history),
  defaultPath: '/',
  stackSeparator: '/',
  localStorage: window?.localStorage,
  onSwitch: (path, history, backHistory) => undefined as any,
}

if (config.isBrowser) {
  config.defaultPath = getPathFromUrl()
}