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
  console.log(component)
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: acceptTag,
      item: { name, component },
      collect: (monitor) => ({
        isDragging:monitor.isDragging()
      }),
      end:({},monitor)=>{
        console.log(monitor.didDrop())
      },
    }),
    [name],
  )


  return (
    <div ref={drag} style={{cursor:isDragging?"move":"move"}}>
          {component}
    </div>
  )
})
