export let defaultLocalStorage = window?.localStorage

export function setLocalStoirage(newLocalStorage: any) {
  defaultLocalStorage = newLocalStorage
}