'use client'
import type {  FC } from 'react'
import { memo } from 'react'
import { useDrag } from 'react-dnd'
import { acceptTag } from './Dustbin'

export interface BoxProps {
  name: string
  component: React.ReactNode
}

export const Box: FC<BoxProps> = memo(function Box({ name,  component }) {
  const [, drag] = useDrag(
    () => ({
      type: acceptTag,
      item: { name, component },
    }),
    [name],
  )


  return (
    <div ref={drag} >
          {component}
    </div>
  )
})
