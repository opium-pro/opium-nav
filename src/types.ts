export type HistoryItem = [path: string, params?: object]

export type Params = {[param: string]: any}

export type ContextType = {
  history: HistoryItem[]
  stackHistory: HistoryItem[]
  backHistory: HistoryItem[]
  path: string
  splitPath: string[]
  cleanPath: string
  params?: Params
  queryParams?: Params
  calledParams?: Params
  propsParams?: Params
  nameParams?: Params
  hasToRender?: boolean
}