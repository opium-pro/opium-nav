export let defaultLocalStorage = window?.localStorage
export function setLocalStoirage(newLocalStorage: any) {
  defaultLocalStorage = newLocalStorage
}


export let handleChange
export function onChange(func) {
  handleChange = func
}