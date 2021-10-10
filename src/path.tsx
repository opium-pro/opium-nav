import React, { FC, memo, useEffect } from 'react'
import { useNav } from './context'
import { ParamsContext } from './context'
import queryString from 'query-string'
import { setMatched, matched } from './router'


export interface PathProps {
  name?: string
  component: any
  cover?: boolean
}

export const Path: FC<PathProps> = memo(({
  name,
  component,
  cover,
  ...rest
}) => {
  const Component = component
  const nav = useNav()
  const params = { ...rest }

  // Add params from path
  const pathParams = queryString.parse(nav.fullPath?.split('?')[1]) || {}
  for (const key in pathParams) { params[key] = pathParams[key] }

  const splitPath = nav.path?.replace(/^\//, '').replace(/\/$/, '')?.split('/') || []
  const splitName = name?.replace(/^\//, '').replace(/\/$/, '')?.split('/') || []
  const normilizedName: any = []

  // Raplace variables in name
  for (const index in splitName) {
    const namePart = splitName[index]
    const pathPart = splitPath[index]
    if (namePart?.[0] === ':') {
      const varName = namePart.slice(1)
      params[varName] = pathPart
      normilizedName.push(pathPart || namePart)
    } else {
      normilizedName.push(namePart)
    }
  }

  const pathsToMount =
    (nav.history.length > nav.keepMounted + 1
      ? nav.history.slice(-nav.keepMounted - 1)
      : nav.history)
      .map((onePath) => onePath.split('?')[0].replace(/^\//, '').replace(/\/$/, ''))

  const zIndex = pathsToMount.lastIndexOf(normilizedName.join('/'))

  const newStyle: any = { zIndex }
  if (cover) {
    newStyle.position = 'absolute'
    newStyle.left = 0
    newStyle.top = 0
    newStyle.width = '100%'
    newStyle.height = '100%'
  }

  const render = (
    <ParamsContext.Provider value={params}>
      <Component
        style={newStyle}
        {...params}
        nav={nav}
      />
    </ParamsContext.Provider>
  )

  if (zIndex < 0) {
    if (!matched && !name) {
      // 404 page
      return render
    }
    return null
  }

  setMatched()
  return render
})