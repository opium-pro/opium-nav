import React, { FC, useCallback } from 'react'
import { useNav } from './context'
// import { BaseComponent } from './settings'


export interface StackProps {
  cacheSize?: number
}

export const Stack: FC<StackProps> = ({
  cacheSize = 3,
  children,
}) => {
  const nav = useNav()

  const render = useCallback(() => {
    const result: any = []
    nav.history.forEach(([path, params], index) => {
      const childrenArray = React.Children.toArray(children)

      let Component: any = childrenArray.filter((child: any) => child.props.name === path)?.map((child: any) => child.props.component)[0]

      // 404
      if (!Component) {
        Component = childrenArray.filter((child: any) => !child.props.name)?.map((child: any) => child.props.component)[0]
      }

      if (cacheSize + index >= nav.history.length) {
        result.push(
          <Component
            {...params}
            nav={nav}
            key={index}
          />
        )
      }
    })
    return result
  }, [nav.history])

  return render()
}