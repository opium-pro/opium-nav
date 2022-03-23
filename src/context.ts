import { createContext, useContext } from 'react'

export let state
export let setState


export function getState() {
  return state
}

export function setSetState(func, value) {
  setState = func
  state = value
}

export const Context = createContext({} as any)
export const useLocation = () => useContext(Context)

export const ParamsContext = createContext({} as any)
export const useParams = () => useContext(ParamsContext)