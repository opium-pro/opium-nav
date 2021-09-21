import React, { useState, FC, useEffect } from 'react'
import { Context } from './context'


export interface RouterProps {
  defaultPath?: string
  defaultStack?: { [key: string]: string[] }
}


export const Router: FC<RouterProps> = ({
  defaultPath = '/',
  defaultStack = {
    default: [defaultPath]
  },
  ...rest
}) => {
  const [browser] = useState(!!(window?.location && window?.history))
  const [stack, setStack] = useState({})
  const [historyName, setHistoryName] = useState(Object.keys(defaultStack)[0])

  const history = stack[historyName] || []
  const path = history[history.length - 1]

  function setHistory(history: string[]) {
    setStack({
      ...stack,
      [historyName]: history,
    })
  }

  function switchHistory(name: string) {
    const newStack = { ...stack }
    if (!newStack[name]) {
      newStack[name] = [defaultPath]
      setStack(newStack)
    }
    setHistoryName(name)
  }

  function go(path: string, params?: object) {
    let newPath = path
    if (params) {
      newPath += '?'
      for (const key in params) {
        newPath += `${key}=${params[key]}`
      }
    }
    const newHistory = [...stack[historyName], newPath]
    setHistory(newHistory)
  }

  function back() {
    if (history?.length > 1) {
      const newHistory = history.slice(0, history.length - 1)
      setHistory(newHistory)
    }
  }

  function clear() {
    setHistory([stack[historyName][0]])
  }

  // Change browser path
  useEffect(() => {
    if (!stack[historyName]) {
      return
    }

    if (browser) {
      window.history.pushState(null, '', path)
    }
  }, [stack, historyName])

  // Add current url to history on first loading
  useEffect(() => {
    if (browser) {
      const currentPath = window.location.pathname + window.location.search
      if (currentPath !== path) {
        defaultStack[historyName] = [...defaultStack[historyName], currentPath]
      }
    }

    setStack(defaultStack)
  }, [])

  function reload() {
    if (browser) {
      window.history.go?.()
    }
  }

  useEffect(() => {
    if (browser) {
      window.addEventListener?.('popstate', reload)
      return () => window.removeEventListener?.('popstate', reload)
    }
    return
  }, [])


  if (!stack[historyName]) {
    return null
  }

  return (
    <Context.Provider {...rest} value={{
      stack,
      history,
      path,
      go,
      back,
      setHistory,
      switchHistory,
      clear,
      reload,
      browser,
    }} />
  )
}