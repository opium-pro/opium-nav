export type HistoryItem = [path: string, params?: object]

export type UseParams = {[param: string]: any}

export type UseLocation = {
  history: HistoryItem[],
  stackHistory: HistoryItem[],
  backHistory: HistoryItem[],
  path: string,
  cleanPath: string,
}