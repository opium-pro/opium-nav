import React, { FC } from 'react'
import { useNav } from './context'


export interface PathProps {
  name?: string,
  component: any,
  includes?: boolean,
}


export const Path: FC<PathProps> = ({ includes, name, component }) => {
  const Component = component
  const nav = useNav()

  const render = () => <Component nav={nav} />

  if (nav.path === name) {
    return render()
  }

  if (includes && nav.path.includes(name)) {
    return render()
  }

  return null
}
