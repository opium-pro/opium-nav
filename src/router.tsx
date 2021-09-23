import React, { useState, FC, useEffect } from 'react'
import { Context } from './context'


export interface RouterProps {
  defaultPath?: string
  defaultStack?: { [key: string]: string[] }
}

function useForceUpdate() {
  const [value, setValue] = useState(0)
  return {
    forceUpdate: (event) => {setValue(value => value + 1)},
    forceUpdated: value
  }
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
  const { forceUpdate, forceUpdated } = useForceUpdate()

  const history = stack[historyName] || []
  const path = history[history?.length - 1]

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

  function go(path: string, params?: object, writeHistory = true) {
    let newPath = path
    if (params) {
      newPath += '?'
      for (const key in params) {
        newPath += `${key}=${params[key]}`
      }
    }
    // const newHistory = [...(stack[historyName] || []), newPath]
    const newHistory = writeHistory
      ? [...(stack[historyName] || []), newPath]
      : [...(stack[historyName] || [])?.slice(0, -1), newPath]
    setHistory(newHistory)
    browser && writeHistory && window.history.pushState(null, '', path)
  }

  function replace(path: string, params?: object) {
    go(path, params, false)
  }

  function back(writeBrowserHistory = true) {
    if (history?.length > 1) {
      const newHistory = history.slice(0, -1)
      setHistory(newHistory)
      browser && writeBrowserHistory && window.history.pushState(null, '', newHistory.slice(-1))
    }
  }

  function clear() {
    setHistory([stack[historyName][0]])
  }

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

  // Track browser back and forward
  useEffect(() => {
    if (browser) {
      window.addEventListener?.('popstate', forceUpdate)
      return () => window.removeEventListener?.('popstate', forceUpdate)
    }
    return
  }, [])
  useEffect(() => {
    if (browser) {
      const newPath = window.location.pathname+window.location.search
      go(newPath, null, false)
    }
  }, [forceUpdated])

  if (!stack[historyName]) { return null }

  return (
    <Context.Provider {...rest} value={{
      stack,
      history,
      path,
      go,
      replace,
      back,
      setHistory,
      switchHistory,
      clear,
      reload,
      browser,
    }} />
  )
}