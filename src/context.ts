import { createContext, useContext as useReactContext } from 'react'
import { ContextType } from './types'

export let state
export let setState


export function getState() {
  return state
}

export function setSetState(func, value) {
  setState = func
  state = value
}

export const PathContext = createContext({} as ContextType)
export const usePath = () => useReactContext(PathContext)