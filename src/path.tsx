import React, { FC } from 'react'
import { PathContext, usePath } from './context'
import { setMatched, matched } from './router'
import { parseQuery } from './utils'
import { config } from './config'
import { Params } from './types'


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
    ...restParams
  } = props
  const context = usePath()

  const calledParams: Params = history.length ? (context?.history.slice(-1)[0][1] || {}) : {}
  const pathParams: Params = context?.path.includes('?')
    ? parseQuery(context?.path.split('?')[1]) || {}
    : {}
  const nameParams: Params = {}

  const normilizedName: any = []
  const splitName = name?.replace(/^\//, '').replace(/\/$/, '')?.split(config.stackSeparator) || []
  const splitPath = context?.path?.replace(/^\//, '').replace(/\/$/, '')?.split(config.stackSeparator) || []
  // Raplace variables in name
  for (const index in splitName) {
    const namePart = splitName[index]
    const pathPart = splitPath[index]
    if (namePart?.[0] === ':') {
      const varName = namePart.slice(1)
      nameParams[varName] = pathPart
      normilizedName.push(pathPart || namePart)
    } else {
      normilizedName.push(namePart)
    }
  }

  const allParams: Params = { ...calledParams, ...pathParams, ...nameParams, ...restParams }
  const Component: any = component
  const render = (
    <PathContext.Provider value={{
      ...context,
      params: allParams,
      pathParams,
      calledParams,
      nameParams,
      restParams: restParams as Params,
    }}>
      <Component {...allParams} />
    </PathContext.Provider>
  )

  const fullName = normilizedName.join(config.stackSeparator)
  const hasToRender = parent ? context?.cleanPath.indexOf(fullName) === 0 : fullName === context?.cleanPath
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