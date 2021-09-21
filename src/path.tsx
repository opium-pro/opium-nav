import React, { FC, useEffect, useState } from 'react'
import { useNav } from './context'
import { Context } from './context'
import queryString from 'query-string'


export interface PathProps {
  name?: string,
  component: any,
  includes?: boolean,
}


export const Path: FC<PathProps> = ({ includes, name, component }) => {
  const Component = component
  const nav = useNav()
  const [params, setParams]: any = useState()
  const [mathes, setMathes]: any = useState()

  let currentName

  useEffect(() => {
    const splitPath = nav.path.split('?')
    const query = queryString.parse(splitPath[1])
    setParams(query)
  }, [nav.path])


  useEffect(() => {
    const onlyPath = nav.path?.split('?')[0]
    const splitPath = onlyPath?.replace(/\/$/, '').split('/') || []
    const splitName = name?.split('/') || []
    const newParams = { ...params }
    const newName: any = []
    let update = false
    let render = true
    splitName.forEach((namePart, index) => {
      const pathPart = splitPath[index]
      if (namePart?.[0] === ':') {
        const varName = namePart.slice(1)
        newParams[varName] = pathPart
        update = true
        newName.push(pathPart || namePart)
      } else if (namePart !== pathPart) {
        update = false
        render = false
        return
      } else {
        newName.push(namePart)
      }
    })
    update && setParams(newParams)

    if (render) {
      if ((splitPath.join('/') === newName.join('/'))) {
        !mathes && setMathes(true)
      } else {
        mathes && setMathes(false)
      }
    } else {
      mathes && setMathes(false)
    }
  }, [nav.path])

  const render = () => (
    <Context.Provider value={{...nav, params}}>
      <Component nav={nav} />
    </Context.Provider>
  )

  useEffect(() => {
    if (nav.browser) {
      const browserQuery = queryString.parse(window.location.search)
      const newParams = { ...params, ...browserQuery }
      browserQuery && setParams(newParams)
    }
  }, [])

  if (mathes) {
    return render()
  }

  return null
}
