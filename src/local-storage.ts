import { config } from './config'

const key = 'opium-nav-history'

export const localStorage = {
  setHistory: async (value?: any) => {
    if (value instanceof Object) {
      return  config.localStorage?.setItem(key, JSON.stringify(value))
    }
  },

  getHistory: async () => {
    const result = config.localStorage?.getItem(key)
    return result ? JSON.parse(result) : {}
  },

  removeHistory: async () => {
    return config.localStorage?.removeItem(key)
  },
}