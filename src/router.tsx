import React, { useState, FC, useEffect } from 'react'
import { Context } from './context'
import { localStorage } from './local-storage'


export interface RouterProps {
  defaultPath?: string
  defaultHistoryName?: string,
  defaultStack?: { [key: string]: string[] }
  saveState?: boolean
  browser?: boolean
  autoSwitchHistory?: boolean
}

function useForceUpdate() {
  const [value, setValue] = useState(0)
  return {
    forceUpdate: (event?: any) => { setValue(value => value + 1) },
    forceUpdated: value
  }
}


export const Router: FC<RouterProps> = ({
  browser = !!(window?.location && window?.history),
  defaultPath,
  defaultHistoryName,
  defaultStack = {
    [defaultHistoryName]: [defaultPath]
  },
  saveState = false,
  autoSwitchHistory,
  ...rest
}) => {
  const [isBrowser] = useState(browser)
  const [isReady, setIsReady] = useState(false)
  const [stack, setStack] = useState(defaultStack)
  const [historyName, setHistoryName] = useState(defaultHistoryName)
  const { forceUpdate, forceUpdated } = useForceUpdate()

  const history = stack[historyName] || [defaultPath]
  const path = history[history?.length - 1]

  function setHistory(history: string[]) {
    setStack({
      ...stack,
      [historyName]: history,
    })
  }

  function switchHistory(name: string, initialPath?: string, reset = false) {
    const newPath = initialPath || defaultPath || name
    const newStack = { ...stack }
    if (!newStack[name]) {
      newStack[name] = [newPath]
      setStack(newStack)
    }
    if (reset || (historyName === name)) {
      clear(newPath)
    } else {
      setHistoryName(name)
    }
  }

  function combinePath(path?: string, params?: { [key: string]: any } | null) {
    let newPath = path || history[0]
    if (params) {
      newPath += path?.indexOf('?') >= 0 ? '&' : '?'
      Object.keys(params).forEach((key, index) => {
        const isLast = index + 1 === Object.keys(params).length
        newPath += `${key}=${params[key]}${isLast ? '' : '&'}`
      })
    }
    if (autoSwitchHistory && (newPath.indexOf(historyName) !== 0)) {
      for (const name in stack) {
        if (newPath.indexOf(name) === 0) {
          switchHistory(name, newPath)
          return
        }
      }
    }
    return newPath
  }

  function go(path?: string, params?: object | null) {
    const newPath = combinePath(path, params)
    const newHistory = [...history, newPath]
    newPath && setHistory(newHistory)
  }

  function replace(path?: string, params?: object) {
    const newPath = combinePath(path, params)
    const newHistory = [...history?.slice(0, -1), newPath]
    newPath && setHistory(newHistory)
  }

  function back() {
    let newHistory
    if (history?.length > 1) {
      newHistory = history.slice(0, -1)
      setHistory(newHistory)
    } else if (historyName !== defaultHistoryName) {
      switchHistory(defaultHistoryName, defaultPath)
    }
  }

  function clear(initialPath) {
    setHistory([initialPath || stack[historyName][0]])
  }

  function reset(path = defaultPath) {
    const newStack = {
      ...defaultStack,
      [defaultHistoryName]: [path]
    }
    setStack(newStack)
    setHistoryName(defaultHistoryName)
  }

  function reload() {
    forceUpdate()
    if (isBrowser) {
      window.history.go?.()
    }
  }

  // Handle localstorge
  // Before render
  useEffect(() => {
    if (isBrowser) {
      const browserPath = window.location.pathname + window.location.search
      if (browserPath !== path) {
        setHistory([...history, browserPath])
      }
    }

    saveState ? localStorage.getHistory().then((local) => {
      if (!local) { return }
      const newHistory = local.stack[local.historyName] || [defaultPath]
      if (isBrowser) {
        const browserPath = window.location.pathname + window.location.search
        if (browserPath !== newHistory.slice(-1)[0]) {
          newHistory.push(browserPath)
        }
      }
      const newStack = { ...local.stack, [local.historyName]: newHistory }
      setStack(newStack)
      if (historyName !== local.historyName) {
        setHistoryName(local.historyName)
      }
    }) : localStorage.removeHistory()

    setTimeout(() => setIsReady(true))
  }, [])

  // Track isBrowser back and forward
  useEffect(() => {
    if (isBrowser) {
      window.addEventListener?.('popstate', forceUpdate)
      return () => window.removeEventListener?.('popstate', forceUpdate)
    }
  }, [])

  // Update browser path
  useEffect(() => {
    if (isReady && isBrowser) {
      const browserPath = window.location.pathname + window.location.search
      if (browserPath !== path) {
        window.history.pushState(null, '', path)
      }
    }
  }, [path, isReady])

  // Update localstorage
  useEffect(() => {
    isReady && saveState && localStorage.setHistory({ stack, historyName })
  }, [stack, historyName, isReady])

  // Back and Forward click
  useEffect(() => {
    if (forceUpdated && isBrowser) {
      const newPath = window.location.pathname + window.location.search
      if (newPath !== path) {
        go(newPath)
      }
    }
  }, [forceUpdated])

  if (!stack[historyName] || !isReady) { return null }

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
      historyName,
      clear,
      reload,
      isBrowser,
      reset,
    }} />
  )
}