import React, { FC, PropsWithChildren } from 'react'
import { PathContext, usePath } from './context'
import { setMatched, matched } from './router'
import { parseQuery } from './utils'
import { Params } from './types'
import { match } from './match'


export type PathProps = PropsWithChildren<{
  name?: string
  component: any
  forceRender?: boolean
  parent?: boolean
}>

export const Path: FC<PathProps> = (props) => {
  const {
    name,
    component,
    forceRender,
    parent,
    ...propsParams
  } = props
  const context = usePath()

  const calledParams: Params = history.length ? (context?.history.slice(-1)[0][1] || {}) : {}
  const queryParams: Params = context?.path.includes('?')
    ? parseQuery(context?.path.split('?')[1]) || {}
    : {}
  const [hasToRender, nameParams] = match(name, context.path, parent)

  const allParams: Params = { ...calledParams, ...queryParams, ...nameParams, ...propsParams }
  const Component: any = component
  const render = (
    <PathContext.Provider value={{
      ...context,
      params: allParams,
      queryParams,
      calledParams,
      nameParams,
      hasToRender,
      propsParams: propsParams as Params,
    }}>
      <Component {...allParams} />
    </PathContext.Provider>
  )

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