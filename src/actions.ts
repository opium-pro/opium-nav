import { setState, getState } from './context'
import { getPathfromHistory } from './utils'
import { HistoryItem } from './types'
import { config } from './config'


export { getState }


export function isStack(stackName: string, path = getPathfromHistory(getState().history)) {
  return path.indexOf(stackName) === 0
}


export function getStack(path: string, history): HistoryItem[] {
  const stackhistory = history?.filter(([item]) => isStack(path.split(config.stackSeparator)[0], item))
  let prevItem = []
  const result = stackhistory.filter(item => {
    if ((item[0] === prevItem[0]) && (JSON.stringify(item[1]) === JSON.stringify(prevItem[1]))) {
      return false
    }
    prevItem = item
    return true
  })
  return result
}


export function toStack(name: string, reset: boolean = false) {
  setState(state => {
    const match: HistoryItem[] = getStack(name, state.history)
    const first: HistoryItem = match.length ? match[0] : [name || config.defaultPath, {}]
    const last: HistoryItem = match.length ? match.slice(-1)[0] : [name || config.defaultPath, {}]
    const alreadyInStack = isStack(name, getPathfromHistory(state.history))

    if (alreadyInStack && reset) {
      // Очищаем историю от всех элементов из этого стека
      const newHistory = state.history.filter(item => !isStack(name, item[0]))
      newHistory.push(first)
      return {
        ...state,
        history: newHistory,
      }
    } else if (alreadyInStack) {
      go(...first)
    } else {
      go(...last)
    }
    return state
  })
}


export function go(newPath: string, params?: object | null) {
  setState(state => {
    const path = getPathfromHistory(state.history) || state.defaultPath
    const newState = { ...state }
    if (newPath !== path) {
      newState.history = [...state.history, [newPath, params]]
      newState.backHistory = []
    }
    return newState
  })
}


export function replace(newPath: string, params?: object) {
  setState(state => {
    return newPath !== state.path ? ({
      ...state,
      history: [...state.history?.slice(0, -1), [newPath, params]],
    }) : state
  })
}


export function backInStack(stack?: string) {
  setState(state => {
    const { history } = state
    const path = getPathfromHistory(history)

    if (typeof stack !== 'string') {
      const splitPath = path.split(config.stackSeparator)
      stack = splitPath[0] || `/${splitPath[1]}`
    }
    const stackHistory = getStack(stack as string, history)
    const last = stackHistory.slice(-1)[0]
    function findPrev(index = stackHistory.length - 1): HistoryItem {
      if (index < 0) {
        return [stack as string, {}]
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
    return {
      ...state,
      history: newHistory,
      backHistory: [...state.backHistory, ...state.history.slice(-1)],
    }
  })
}


export function back(pop = 1, write = true) {
  if (typeof pop !== 'number') {
    pop = 1
  }

  setState(state => {
    const newState = { ...state }
    if (state.history.length > pop) {
      newState.history = state.history.slice(0, -pop)
      const popped = state.history.slice(-pop)
      if (write) {
        newState.backHistory = [...state.backHistory, ...popped.reverse()]
      }
    } else if (config.isBrowser) {
      window.history?.back?.()
    }
    return newState
  })
}


export function forward() {
  setState(state => {
    const { history, backHistory } = state
    if (state.backHistory.length) {
      return {
        ...state,
        history: [...history, ...backHistory.slice(-1)],
        backHistory: [...backHistory.slice(0, -1)],
      }
    }
    return state
  })
}


export function reset(initialPath?: string) {
  setState(state => ({
    ...state,
    history: [[initialPath || config.defaultPath, {}]],
  }))
}

export function reload() {
  setState(state => state)
  if (config.isBrowser) {
    window.history.go?.()
  }
}