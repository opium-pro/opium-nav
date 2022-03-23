import { createContext, useContext } from 'react'
import { UseParams, UseLocation } from './types'

export let state
export let setState


export function getState() {
  return state
}

export function setSetState(func, value) {
  setState = func
  state = value
}

export const Context = createContext({} as UseLocation)
export const useLocation = () => useContext(Context)

export const ParamsContext = createContext({} as UseParams)
export const useParams = () => useContext(ParamsContext)