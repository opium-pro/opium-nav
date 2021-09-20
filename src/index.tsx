import { Router } from './router'
import * as path from './path'

type Susanin = typeof Router & typeof path
const susanin: Susanin = (Router as Susanin)


Object.keys(path).forEach((key) => {
  susanin[key] = path[key]
})


export default susanin
export * from './router'
export * from './path'
export * from './context'