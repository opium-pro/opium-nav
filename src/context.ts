import { createContext, useContext } from 'react'

export const Context = createContext({} as any)
export const useNav = () => useContext(Context)

export const ParamsContext = createContext({} as any)
export const useParams = () => useContext(ParamsContext)