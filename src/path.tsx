import React, { FC } from 'react'
import { useNav } from './context'
import { ParamsContext } from './context'
import { setMatched, matched } from './router'


export interface PathProps {
  name?: string
  component: any
  nav?: any,
}

export const Path: FC<PathProps> = (props) => {
  const {
    name,
    component,
    nav = useNav(),
    ...rest
  } = props

  const newParams = { ...nav.params, ...rest }
  const normilizedName: any = []
  const splitName = name?.replace(/^\//, '').replace(/\/$/, '')?.split('/') || []
  const splitPath = nav.path?.replace(/^\//, '').replace(/\/$/, '')?.split('/') || []
  // Raplace variables in name
  for (const index in splitName) {
    const namePart = splitName[index]
    const pathPart = splitPath[index]
    if (namePart?.[0] === ':') {
      const varName = namePart.slice(1)
      newParams[varName] = pathPart
      normilizedName.push(pathPart || namePart)
    } else {
      normilizedName.push(namePart)
    }
  }

  const Component: any = component
  const render = (
    <ParamsContext.Provider value={newParams}>
      <Component
        {...newParams}
        nav={nav}
      />
    </ParamsContext.Provider>
  )

  const hasToRender = normilizedName.join('/') === nav.cleanPath
  if (hasToRender) {
    setMatched()
    return render
  }

  // 404 page
  if (!matched && !name) {
    return render
  }

  return null
}