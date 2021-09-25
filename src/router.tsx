import React, { useState, FC, useEffect } from 'react'
import { Context } from './context'
import { localStorage } from './local-storage'
import { handleChange } from './settings'


export interface RouterProps {
  defaultPath?: string
  defaultStack?: string,
  defaultFullStory?: { [key: string]: string[] }
  saveState?: boolean
  browser?: boolean
  autoSwitchStack?: boolean
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
  defaultStack,
  defaultFullStory = {
    [defaultStack]: [defaultPath]
  },
  saveState = false,
  autoSwitchStack,
  ...rest
}) => {
  const [isBrowser] = useState(browser)
  const [isReady, setIsReady] = useState(false)
  const [fullHistory, setFullHistory] = useState(defaultFullStory)
  const [stack, setStack] = useState(defaultStack)
  const { forceUpdate, forceUpdated } = useForceUpdate()

  const history = fullHistory[stack] || [defaultPath]
  const path = history[history?.length - 1]

  function setHistory(history: string[]) {
    setFullHistory({
      ...fullHistory,
      [stack]: history,
    })
  }

  function toStack(name: string, initialPath?: string, reset = false) {
    const newPath = initialPath || defaultPath || name
    const newStack = { ...fullHistory }
    if (!newStack[name]) {
      newStack[name] = [newPath]
      setFullHistory(newStack)
    }
    if (reset || (stack === name)) {
      clear(newPath)
    } else {
      setStack(name)
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
    if (autoSwitchStack && (newPath.indexOf(stack) !== 0)) {
      for (const name in fullHistory) {
        if (newPath.indexOf(name) === 0) {
          toStack(name, newPath)
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
    } else if (stack !== defaultStack) {
      toStack(defaultStack, defaultPath)
    }
  }

  function clear(initialPath) {
    setHistory([initialPath || fullHistory[stack][0]])
  }

  function reset(path = defaultPath) {
    const newStack = {
      ...defaultFullStory,
      [defaultStack]: [path]
    }
    setFullHistory(newStack)
    setStack(defaultStack)
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
      const newHistory = local.fullHistory[local.stack] || [defaultPath]
      if (isBrowser) {
        const browserPath = window.location.pathname + window.location.search
        if (browserPath !== newHistory.slice(-1)[0]) {
          newHistory.push(browserPath)
        }
      }
      const newStack = { ...local.fullHistory, [local.stack]: newHistory }
      setFullHistory(newStack)
      if (stack !== local.stack) {
        setStack(local.stack)
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
    isReady && saveState && localStorage.setHistory({ fullHistory, stack })
  }, [fullHistory, stack, isReady])

  // Back and Forward click
  useEffect(() => {
    if (forceUpdated && isBrowser) {
      const newPath = window.location.pathname + window.location.search
      if (newPath !== path) {
        go(newPath)
      }
    }
  }, [forceUpdated])

  // Track changes
  useEffect(() => {
    handleChange?.(path, fullHistory, stack)
  }, [fullHistory, stack])

  if (!fullHistory[stack] || !isReady) { return null }

  return (
    <Context.Provider {...rest} value={{
      fullHistory,
      history,
      path,
      go,
      replace,
      back,
      setHistory,
      toStack,
      stack,
      clear,
      reload,
      isBrowser,
      reset,
    }} />
  )
}