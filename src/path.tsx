import React, { FC } from 'react'
import { useLocation, ParamsContext } from './context'
import { setMatched, matched } from './router'
import { parseQuery } from './utils'
import { config } from './config'


export interface PathProps {
  name?: string
  component: any
  forceRender?: boolean
  parent?: boolean
}

export const Path: FC<PathProps> = (props) => {
  const {
    name,
    component,
    forceRender,
    parent,
    ...rest
  } = props
  const { path, history, cleanPath } = useLocation()

  const params = history.length ? (history.slice(-1)[0][1] || {}) : {}
  if (path.includes('?')) {
    const pathParams = parseQuery(path.split('?')[1]) || {}
    Object.assign(params, pathParams)
  }

  const newParams = { ...params, ...rest }
  const normilizedName: any = []
  const splitName = name?.replace(/^\//, '').replace(/\/$/, '')?.split(config.stackSeparator) || []
  const splitPath = path?.replace(/^\//, '').replace(/\/$/, '')?.split(config.stackSeparator) || []
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
      <Component {...newParams} />
    </ParamsContext.Provider>
  )
  
  const fullName = normilizedName.join(config.stackSeparator)
  const hasToRender = parent ? cleanPath.indexOf(fullName) === 0 : fullName === cleanPath
  if (hasToRender) {
    setMatched()
    return render
  }

  // 404 page
  if (!matched && !name) {
    return render
  }

  if (forceRender) {
    return render
  }

  return null
}