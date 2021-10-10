import React, { useState, FC, useEffect } from 'react'
import { Context } from './context'
import { localStorage } from './local-storage'
import { handleChange } from './settings'


export let matched: any
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
  keepMounted?: number
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
  keepMounted = 0,
  ...rest
}) => {
  const [isReady, setIsReady] = useState(false)
  const [history, setHistory] = useState(defaultHistory)
  const [backHistory, setBackHistory] = useState(defaultBackHistory)
  const { forceUpdate, forceUpdated } = useForceUpdate()

  const fullPath = history.length ? history.slice(-1)[0] : defaultPath
  const path = fullPath.split('?')[0]

  function isStack(name: string) {
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

  function combinePath(newPath: string, params?: { [key: string]: any } | null): string {
    if (!newPath) { return defaultPath }
    if (params) {
      newPath += newPath?.indexOf('?') >= 0 ? '&' : '?'
      Object.keys(params).forEach((key, index) => {
        const isLast = index + 1 === Object.keys(params).length
        newPath += `${key}=${params[key]}${isLast ? '' : '&'}`
      })
    }
    return newPath
  }

  function go(newPath: string, params?: object | null) {
    newPath = combinePath(newPath, params)
    if (newPath !== history.slice(-1)[0]) {
      setHistory([...history, newPath])
      setBackHistory([])
    }
  }

  function replace(newPath: string, params?: object) {
    newPath = combinePath(newPath, params)
    setHistory([...history?.slice(0, -1), newPath])
  }

  function backInStack(stack: string) {
    if (typeof stack !== 'string') {
      const splitPath = path.split('/')
      stack = splitPath[0] || `/${splitPath[1]}`
    }
    const stackHistory = history.filter(item => item.indexOf(stack) === 0)
    const last = stackHistory.slice(-1)[0]
    function findPrev(index = stackHistory.length - 1) {
      if (index < 0) {
        return stack
      }
      if (stackHistory[index] !== last) {
        return stackHistory[index]
      }
      return findPrev(index - 1)
    }
    const prev = findPrev()
    const newHistory = history.length ? [...history.slice(0, -1)] : [stack]
    if (prev !== newHistory.slice(-1)[0]) {
      newHistory.push(prev)
    }
    setBackHistory([...backHistory, ...history.slice(-1)])
    setHistory(newHistory)
  }

  function back(pop?: number) {
    if (typeof pop !== 'number') {
      pop = 1
    }

    let newHistory
    let popped
    if (history.length > 1 && pop < history.length) {
      newHistory = history.slice(0, -pop)
      popped = history.slice(-pop)
      setHistory(newHistory)
    } else {
      popped = [...history]
      newHistory = [defaultPath]
    }
    setHistory(newHistory)
    setBackHistory([...backHistory, ...popped.reverse()])
  }

  function forward() {
    if (backHistory.length) {
      setHistory([...history, backHistory.slice(-1)[0]])
      setBackHistory([...backHistory.slice(0, -1)])
    }
  }

  function reset(initialPath?: string) {
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
      if (browserPath !== fullPath) {
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
      if (browserPath !== fullPath) {
        window.history.pushState(null, '', fullPath)
      }
    }
  }, [fullPath, isReady])

  // Update localstorage
  useEffect(() => {
    isReady && saveState && localStorage.setHistory({ history, backHistory })
  }, [history, backHistory, isReady])

  // Back and Forward click
  useEffect(() => {
    if (forceUpdated && browser) {
      const newPath = window.location.pathname + window.location.search
      if (newPath !== fullPath) {
        go(newPath)
      }
    }
  }, [forceUpdated])

  // Track changes
  useEffect(() => {
    handleChange?.(fullPath, history, backHistory)
  }, [history, backHistory])

  useEffect(() => {
    setMatched(false)
  }, [fullPath])

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
      backInStack,
      fullPath,
      keepMounted,
    }} />
  )
}