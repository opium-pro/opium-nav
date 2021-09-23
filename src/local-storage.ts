import { defaultLocalStorage } from './settings'

const key = 'opium-nav-history'

export const localStorage = {
  setHistory: async (value?: any) => {
    if (value instanceof Object) {
      return  defaultLocalStorage.setItem(key, JSON.stringify(value))
    }
  },

  getHistory: async () => {
    return JSON.parse(defaultLocalStorage.getItem(key))
  },

  removeHistory: async () => {
    return defaultLocalStorage.removeItem(key)
  },
}