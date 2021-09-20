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
    const newHistory = [...stack[historyName], path]
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
      return null
    }

    if (browser) {
      const currentPath = window.location.pathname
      if (currentPath !== path) {
        window.history.pushState(null, null, path);
      }
    }
  }, [stack, historyName])

  // Add current url to history on first loading
  useEffect(() => {
    if (browser) {
      const currentPath = window.location.pathname
      if (currentPath !== path) {
        defaultStack[historyName] = [...history, currentPath]
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
    }} />
  )
}