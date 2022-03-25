import { useState } from 'react'


export function getPathfromHistory(history) {
  return !!history?.length && history.slice(-1)[0][0]
}


export function useUpdate() {
  const [value, setValue]: any = useState(0)
  return [
    () => { setValue(value => value + 1) },
    value,
  ]
}

export function parseQuery(query: string) {
  const result = {}
  const varList = query.split('&')
  for (const varLine of varList) {
    const [varName, varValue] = varLine.split('=')
    result[varName] = varValue
  }
  return result
}


export function getPathFromUrl() {
  const url = window?.location.toString()
  const splitPath = url.split('://')[1]?.split('/')
  splitPath.shift()
  return `/${splitPath.join('/')}`
}