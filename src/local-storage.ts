import { defaultLocalStorage } from './settings'

const key = 'opium-nav-history'

export const localStorage = {
  setHistory: async (value?: any) => {
    if (value instanceof Object) {
      return  defaultLocalStorage?.setItem(key, JSON.stringify(value))
    }
  },

  getHistory: async () => {
    const result = defaultLocalStorage?.getItem(key)
    return result ? JSON.parse(result) : {}
  },

  removeHistory: async () => {
    return defaultLocalStorage?.removeItem(key)
  },
}