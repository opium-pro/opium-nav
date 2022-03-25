import React, { useState, FC, useEffect } from 'react'
import { PathContext, setSetState } from './context'
import { localStorage } from './local-storage'
import { config } from './config'
import { getPathfromHistory } from './utils'
import * as nav from './actions'
import { useUpdate, getPathFromUrl } from './utils'
import { HistoryItem } from './types'


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
  history?: HistoryItem[]
  backHistory?: HistoryItem[]
  saveState?: boolean
  browser?: boolean
}


export const Router: FC<RouterProps> = ({
  history: defaultHistory = [[config.defaultPath, {}]],
  backHistory: defaultBackHistory = [],
  saveState = false,
  ...rest
}) => {
  const [isReady, setIsReady] = useState(false)
  const [update, updated] = useUpdate()
  const [state, setState]: any = useState({
    history: defaultHistory,
    backHistory: defaultBackHistory,
  })
  setSetState(setState, state)
  const { history, backHistory } = state
  const path = getPathfromHistory(history) || config.defaultPath
  const cleanPath = path.split('?')[0]?.replace(/^\//, '').replace(/\/$/, '')

  useEffect(() => {
    if (!history.length) {
      setState(state => ({
        ...state,
        history: defaultHistory,
      }))
    }
  }, [history])

  // Handle localstorge
  // Before render
  useEffect(() => {
    saveState ? localStorage.getHistory().then((local) => {
      if (!local) { return }

      const newHistory = local.history || defaultHistory
      if (config.isBrowser) {
        const browserPath = getPathFromUrl()
        if (browserPath !== newHistory.slice?.(-1)?.[0]?.[0]) {
          newHistory.push([browserPath, {}])
        }
      }
      const newBackHistory = local.backHistory || []
      setState(state => ({
        ...state,
        history: newHistory,
        backHistory: newBackHistory,
      }))
    }) : localStorage.removeHistory()

    setTimeout(() => setIsReady(true))
  }, [])

  // Track browser back and forward
  useEffect(() => {
    if (config.isBrowser) {
      window.addEventListener?.('popstate', update)
      return () => window.removeEventListener?.('popstate', update)
    }
    return
  }, [])

  // Update browser path
  useEffect(() => {
    if (isReady && config.isBrowser) {
      const browserPath = getPathFromUrl()
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
    if (updated && config.isBrowser) {
      const newPath = getPathFromUrl()
      if (newPath !== path) {
        nav.go(newPath)
      }
    }
  }, [updated])

  // Track changes
  useEffect(() => {
    config.handleChange?.(path, history, backHistory)
  }, [history, backHistory])

  useEffect(() => {
    setMatched(false)
  }, [path])

  const stackHistory = nav.getStack(path, history)

  if (!isReady) { return null }

  return (
    <PathContext.Provider {...rest} value={{
      history,
      stackHistory,
      backHistory,
      path,
      cleanPath,
    }} />
  )
}