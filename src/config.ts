export const config = {
  isBrowser: !!(window?.location && window?.history),
  defaultPath: '/',
  stackSeparator: '/',
  localStorage: window?.localStorage,
  handleChange: (path, history, backHistory) => undefined,
}

if (config.isBrowser) {
  config.defaultPath = window.location.pathname + window.location.search
}