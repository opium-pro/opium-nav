import React, { useState, FC, useEffect } from 'react'
import { Context } from './context'
import { localStorage } from './local-storage'
import { handleChange } from './settings'


export let matched
export function setMatched(arg?: string | false) {
  if (arg === false) {
    matched = undefined
  } else if (!Array.isArray(matched)) {
    matched = [arg]
  } else {
    matched.push(arg)
  }
}


export interface RouterProps {
  history?: string[]
  backHistory?: string[]
  saveState?: boolean
  browser?: boolean
  defaultPath?: string
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
  defaultPath = '/',
  history: defaultHistory = [defaultPath],
  backHistory: defaultBackHistory = [],
  saveState = false,
  ...rest
}) => {
  const [isReady, setIsReady] = useState(false)
  const [history, setHistory] = useState(defaultHistory)
  const [backHistory, setBackHistory] = useState(defaultBackHistory)
  const { forceUpdate, forceUpdated } = useForceUpdate()

  const path = history.length ? history.slice(-1)[0] : defaultPath

  function isStack(name) {
    return path.indexOf(name) === 0
  }

  function toStack(name: string, reset: boolean = false) {
    const initialPath = name
    const match = history.filter(item => item.indexOf(name) === 0)
    const first = match.length ? match[0] : (initialPath || defaultPath)
    const last = match.length ? match.slice(-1)[0] : (initialPath || defaultPath)
    if (isStack(name) || reset) {
      go(first)
    } else {
      go(last)
    }
  }

  function combinePath(path: string, params?: { [key: string]: any } | null): string {
    if (!path) { return defaultPath }
    let newPath = path || history[0]
    if (params) {
      newPath += path?.indexOf('?') >= 0 ? '&' : '?'
      Object.keys(params).forEach((key, index) => {
        const isLast = index + 1 === Object.keys(params).length
        newPath += `${key}=${params[key]}${isLast ? '' : '&'}`
      })
    }
    return newPath
  }

  function go(path: string, params?: object | null) {
    const newPath = combinePath(path, params)
    if (newPath !== history.slice(-1)[0]) {
      setHistory([...history, newPath])
      setBackHistory([])
    }
  }

  function replace(path: string, params?: object) {
    const newPath = combinePath(path, params)
    setHistory([...history?.slice(0, -1), newPath])
  }

  function back(pop: number = 1) {
    let newHistory
    let popped
    if (history.length > 1 && pop < history.length) {
      newHistory = history.slice(0, -pop)
      popped = history.slice(-pop)
      setHistory(newHistory)
    } else {
      popped = history
      setHistory([defaultPath])
    }
    setBackHistory([...backHistory, ...popped.reverse()])
  }

  function forward() {
    if (backHistory.length) {
      setHistory([...history, backHistory.slice(-1)[0]])
      setBackHistory([...backHistory.slice(0, -1)])
    }
  }

  function reset(initialPath) {
    setHistory([initialPath || defaultPath])
  }

  function reload() {
    forceUpdate()
    if (browser) {
      window.history.go?.()
    }
  }

  useEffect(() => {
    if (!history.length) {
      setHistory([defaultPath])
    }
  }, [history])

  // Handle localstorge
  // Before render
  useEffect(() => {
    if (browser) {
      const browserPath = window.location.pathname + window.location.search
      if (browserPath !== path) {
        setHistory([...history, browserPath])
      }
    }

    saveState ? localStorage.getHistory().then((local) => {
      if (!local) { return }
      const newHistory = local.history || [defaultPath]
      if (browser) {
        const browserPath = window.location.pathname + window.location.search
        if (browserPath !== newHistory.slice(-1)[0]) {
          newHistory.push(browserPath)
        }
      }
      const newBackHistory = local.backHistory || []
      setHistory(newHistory)
      setBackHistory(newBackHistory)
    }) : localStorage.removeHistory()

    setTimeout(() => setIsReady(true))
  }, [])

  // Track browser back and forward
  useEffect(() => {
    if (browser) {
      window.addEventListener?.('popstate', forceUpdate)
      return () => window.removeEventListener?.('popstate', forceUpdate)
    }
    return
  }, [])

  // Update browser path
  useEffect(() => {
    if (isReady && browser) {
      const browserPath = window.location.pathname + window.location.search
      if (browserPath !== path) {
        window.history.pushState(null, '', path)
      }
    }
  }, [path, isReady])

  // Update localstorage
  useEffect(() => {
    isReady && saveState && localStorage.setHistory({ history, backHistory })
  }, [history, backHistory, isReady])

  // Back and Forward click
  useEffect(() => {
    if (forceUpdated && browser) {
      const newPath = window.location.pathname + window.location.search
      if (newPath !== path) {
        go(newPath)
      }
    }
  }, [forceUpdated])

  // Track changes
  useEffect(() => {
    handleChange?.(path, history, backHistory)
  }, [history, backHistory])

  useEffect(() => {
    setMatched(false)
  }, [path])

  if (!isReady) { return null }

  return (
    <Context.Provider {...rest} value={{
      history,
      backHistory,
      path,
      go,
      replace,
      back,
      setHistory,
      setBackHistory,
      toStack,
      isStack,
      reload,
      browser,
      reset,
      forward,
    }} />
  )
}