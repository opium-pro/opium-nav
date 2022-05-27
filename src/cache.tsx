import React, { FC, useRef } from 'react'
import { usePath } from './context'
import { match as hasMatch } from './match'
import { PathContext } from './context'


export type CacheProps = {
  size?: number
}


export const Cache: FC<CacheProps> = ({
  size = 5,
  children,
}) => {
  const cached = useRef(new Map()).current
  const { history, path: currentPath } = usePath()

  const render = new Map()

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
      cached.delete(path)
    } else {
      CachedComponent =
        <Component
          key={path}
          {...params}
        />
    }
    cached.set(path, CachedComponent)

    if (render.has(path)) {
      render.delete(path)
    }
    render.set(path, CachedComponent)
  })

  return <>{Array.from(render.values()).slice(-size)}</>
}