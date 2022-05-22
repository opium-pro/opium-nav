import React, { FC, useRef } from 'react'
import { usePath } from './context'


export type CacheProps = {
  size?: number
}


export const Cache: FC<CacheProps> = ({
  size = 5,
  children,
}) => {
  const cached = useRef(new Map()).current
  const { history } = usePath()

  history?.slice(-size).forEach(([path, params], index) => {
    const isLast = index === (history.length >= size ? size - 1 : history.length - 1)

    const childrenArray = React.Children.toArray(children)
    const match: any = childrenArray.find((child: any) => child.props.name === path)
    let Component = match?.props?.component

    // 404
    if (!Component) {
      const notFound: any = childrenArray.find((child: any) => !child.props.name)
      Component = notFound?.props?.component
    }

    if (!Component) { return }

    // Удаляем последний элемент, чтбы он перерендерился
    if (isLast) { cached.delete(path) }

    if (cached.has(path)) {
      const CachedComponent = cached.get(path)
      cached.delete(path)
      cached.set(path, CachedComponent)
    } else {
      cached.set(path, <Component
        {...params}
        key={path}
      />)
    }
  })

  const render = Array.from(cached.values()).slice(-size)
  return <>{render}</>
}