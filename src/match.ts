import { usePath } from './context'
import { config } from './config'
import { Params } from './types'
import { clearPath } from './utils'


export function match(name?: string, path?: string, isParent?: boolean): [match: boolean, params?: Object] {
  const nameParams: Params = {}
  const normilizedName: any = []
  const splitName = name?.replace(/^\//, '').replace(/\/$/, '')?.split(config.stackSeparator) || []
  const splitPath = path?.replace(/^\//, '').replace(/\/$/, '')?.split(config.stackSeparator) || []

  // Raplace variables in name
  for (const index in splitName) {
    const namePart = splitName[index]
    const pathPart = splitPath[index]
    if (namePart?.[0] === ':') {
      const varName = namePart.slice(1)
      nameParams[varName] = pathPart
      normilizedName.push(pathPart || namePart)
    } else {
      normilizedName.push(namePart)
    }
  }

  const cleanPath = clearPath(path)

  const fullName = normilizedName.join(config.stackSeparator)
  const hasToRender = isParent
    ? fullName === cleanPath || cleanPath.indexOf(fullName + config.stackSeparator) === 0
    : fullName === cleanPath

  return [hasToRender, nameParams]
}