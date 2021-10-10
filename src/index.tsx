import { Router } from './router'
import * as path from './path'
import * as stack from './stack'
import * as context from './context'
import * as settings from './settings'


type OpiumNav = typeof Router & typeof path
const opiumNav: OpiumNav = (Router as OpiumNav)


Object.keys(path).forEach((key) => { opiumNav[key] = path[key] })
Object.keys(settings).forEach((key) => { opiumNav[key] = settings[key] })
Object.keys(context).forEach((key) => { opiumNav[key] = context[key] })
Object.keys(stack).forEach((key) => { opiumNav[key] = stack[key] })


export default opiumNav
export * from './router'
export * from './path'
export * from './stack'
export * from './context'
export * from './settings'