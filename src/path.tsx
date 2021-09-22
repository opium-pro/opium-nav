import React, { FC, useEffect, useRef, useState } from 'react'
import { useNav } from './context'
import { ParamsContext } from './context'
import queryString from 'query-string'


export interface PathProps {
  name?: string,
  component: any,
}

export const Path: FC<PathProps> = ({ name, component, ...rest }) => {
  const Component = component
  const nav = useNav()
  const params = { ...rest }

  // Add params from path
  const pathParams = queryString.parse(nav.path?.split('?')[1]) || {}
  for (const key in pathParams) { params[key] = pathParams[key] }

  const cleanPath = nav.path?.split('?')[0]
  const splitPath = cleanPath?.replace(/\/$/, '')?.split('/') || []
  const splitName = name?.split('/') || []
  const normilizedName: any = []

  // Raplace variables in name
  for (const index in splitName) {
    const namePart = splitName[index]
    const pathPart = splitPath[index]
    if (namePart?.[0] === ':') {
      const varName = namePart.slice(1)
      params[varName] = pathPart
      normilizedName.push(pathPart || namePart)
    } else if (namePart !== pathPart) {
      return null
    } else {
      normilizedName.push(namePart)
    }
  }

  const matches = splitPath.join('/') === normilizedName.join('/')
  if (!matches) { return null }

  return (
    <ParamsContext.Provider value={params}>
      <Component params={params} nav={nav} />
    </ParamsContext.Provider>
  )
}
