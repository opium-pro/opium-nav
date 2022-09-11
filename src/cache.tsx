import React, { FC, useRef, PropsWithChildren } from 'react'
import { usePath } from './context'
import { match as hasMatch } from './match'
import { getStack } from './actions'


export type CacheProps = PropsWithChildren<{
  size?: number
  stack?: boolean
  keep?: string[]
}>


export const Cache: FC<CacheProps> = ({
  size = 3,
  children,
  keep = [],
  stack,
}) => {
  const cached = useRef(new Map()).current
  let { history, path: currentPath } = usePath()

  if (stack) {
    history = getStack(currentPath, history)
  }

  history?.slice(-size).forEach(([path, params], index) => {
    const isLast = index === (history.length >= size ? size - 1 : history.length - 1)

    const childrenArray = React.Children.toArray(children)
    const match: any = childrenArray.find((child: any) => hasMatch(child.props.name, currentPath, child.props.parent)?.[0])
    let Component = match?.props?.component

    // 404
    if (!Component) {
      const notFound: any = childrenArray.find((child: any) => !child.props.name)
      Component = notFound?.props?.component
    }

    if (!Component) { return }

    // Удаляем последний элемент, чтбы он перерендерился
    if (isLast) { cached.delete(path) }

    let CachedComponent = cached.get(path)

    if (CachedComponent) {
      cached.set(path, CachedComponent)
    } else {
      cached.set(path, <Component
        key={path}
        {...params}
      />)
    }
  })

  const toRender = new Set(keep)
  history.slice(-size).forEach(([path]) => {
    if (toRender.has(path)) {
      toRender.delete(path)
    }
    toRender.add(path)
  })

  const render = Array.from(toRender).map((path) => cached.get(path))
  return <>{render}</>
}