import React, { useState, FC, useEffect } from 'react'
import { Context } from './context'
import { localStorage } from './local-storage'
import { handleChange } from './settings'
import queryString from 'query-string'


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

export type HistoryItem = [path: string, params?: object]


export interface RouterProps {
  history?: HistoryItem[]
  backHistory?: HistoryItem[]
  saveState?: boolean
  browser?: boolean
  defaultPath?: string
}

function useUpdate() {
  const [value, setValue] = useState(0)
  return [
    (event?: any) => { setValue(value => value + 1) },
    value
  ]
}


export const Router: FC<RouterProps> = ({
  browser = !!(window?.location && window?.history),
  defaultPath = '/',
  history: defaultHistory = [[defaultPath, {}]],
  backHistory: defaultBackHistory = [],
  saveState = false,
  ...rest
}) => {
  const [isReady, setIsReady] = useState(false)
  const [state, setState]: any = useState({
    history: defaultHistory,
    backHistory: defaultBackHistory,
  })
  const [update, updated]: any = useUpdate()
  const { history, backHistory } = state

  const path = history.length ? history.slice(-1)[0][0] : defaultPath
  const cleanPath = path.split('?')[0]?.replace(/^\//, '').replace(/\/$/, '')
  const params = history.length ? (history.slice(-1)[0][1] || {}) : {}
  if (path.includes('?')) {
    const pathParams = queryString.parse(path.split('?')[1]) || {}
    Object.assign(params, pathParams)
  }

  function isStack(stackName: string, currentPath = path) {
    return currentPath.indexOf(stackName) === 0
  }

  function toStack(name: string, reset: boolean = false) {
    const match: HistoryItem[] = history.filter(([item]) => isStack(name, item))
    const first: HistoryItem = match.length ? match[0] : [name || defaultPath, {}]
    const last: HistoryItem = match.length ? match.slice(-1)[0] : [name || defaultPath, {}]
    if (isStack(name) || reset) {
      go(...first)
    } else {
      go(...last)
    }
  }

  // function combinePath(newPath: string, params?: { [key: string]: any } | null): string {
  //   if (!newPath) { return defaultPath }
  //   if (params) {
  //     newPath += newPath?.indexOf('?') >= 0 ? '&' : '?'
  //     Object.keys(params).forEach((key, index) => {
  //       const isLast = index + 1 === Object.keys(params).length
  //       newPath += `${key}=${params[key]}${isLast ? '' : '&'}`
  //     })
  //   }
  //   return newPath
  // }

  function go(newPath: string, params?: object | null) {
    if (newPath !== path) {
      setState({
        ...state,
        history: [...history, [newPath, params]],
        backHistory: [],
      })
    } else {
      update()
    }
  }

  function replace(newPath: string, params?: object) {
    if (newPath !== path) {
      setState({
        ...state,
        history: [...history?.slice(0, -1), [newPath, params]],
      })
    } else {
      update()
    }
  }

  function backInStack(stack: string) {
    if (typeof stack !== 'string') {
      const splitPath = path.split('/')
      stack = splitPath[0] || `/${splitPath[1]}`
    }
    const stackHistory: HistoryItem[] = history.filter(([item]) => item.indexOf(stack) === 0)
    const last = stackHistory.slice(-1)[0]
    function findPrev(index = stackHistory.length - 1): HistoryItem {
      if (index < 0) {
        return [stack, {}]
      }
      if (stackHistory[index][0] !== last[0]) {
        return stackHistory[index]
      }
      return findPrev(index - 1)
    }
    const prev: HistoryItem = findPrev()
    const newHistory: HistoryItem[] = history.length ? [...history.slice(0, -1)] : [[stack, {}]]
    if (prev[0] !== newHistory.slice(-1)[0][0]) {
      newHistory.push(prev)
    }
    setState({
      ...state,
      history: newHistory,
      backHistory: [...backHistory, ...history.slice(-1)],
    })
  }

  function back(pop?: number) {
    if (typeof pop !== 'number') {
      pop = 1
    }

    let newHistory
    let popped
    if (history.length > pop) {
      newHistory = history.slice(0, -pop)
      popped = history.slice(-pop)

      setState({
        ...state,
        history: newHistory,
        backHistory: [...backHistory, ...popped.reverse()],
      })
    }
  }

  function forward() {
    if (backHistory.length) {
      setState({
        ...state,
        history: [...history, ...backHistory.slice(-1)],
        backHistory: [...backHistory.slice(0, -1)],
      })
    }
  }

  function reset(initialPath?: string) {
    setState({
      ...state,
      history: [[initialPath || defaultPath, {}]],
    })
  }

  function reload() {
    update()
    if (browser) {
      window.history.go?.()
    }
  }

  useEffect(() => {
    if (!history.length) {
      setState({
        ...state,
        history: defaultHistory,
      })
    }
  }, [history])

  // Handle localstorge
  // Before render
  useEffect(() => {
    saveState ? localStorage.getHistory().then((local) => {
      if (!local) { return }

      const newHistory = local.history || defaultHistory
      if (browser) {
        const browserPath = window.location.pathname + window.location.search
        if (browserPath !== newHistory.slice?.(-1)?.[0]?.[0]) {
          newHistory.push([browserPath, {}])
        }
      }
      const newBackHistory = local.backHistory || []
      setState({
        ...state,
        history: newHistory,
        backHistory: newBackHistory,
      })
    }) : localStorage.removeHistory()

    setTimeout(() => setIsReady(true))
  }, [])

  // Track browser back and forward
  useEffect(() => {
    if (browser) {
      window.addEventListener?.('popstate', update)
      return () => window.removeEventListener?.('popstate', update)
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
    if (updated && browser) {
      const newPath = window.location.pathname + window.location.search
      if (newPath !== path) {
        go(newPath)
      }
    }
  }, [updated])

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
      toStack,
      isStack,
      reload,
      browser,
      reset,
      forward,
      backInStack,
      cleanPath,
      params,
    }} />
  )
}