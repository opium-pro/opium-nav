export type HistoryItem = [path: string, params?: object]

export type Params = {[param: string]: any}

export type ContextType = {
  history: HistoryItem[]
  stackHistory: HistoryItem[]
  backHistory: HistoryItem[]
  path: string
  cleanPath: string
  params?: Params
  pathParams?: Params
  calledParams?: Params
  restParams?: Params
  nameParams?: Params
  hasToRender?: boolean
}