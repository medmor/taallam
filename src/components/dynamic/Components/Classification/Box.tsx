import type { CSSProperties, FC } from 'react'
import { memo, useCallback, useEffect } from 'react'
import { useDrag } from 'react-dnd'
import Shapes from '../../Shapes'

export interface BoxProps {
  name: string
  type: string,
  component: React.ReactNode
}

export const Box: FC<BoxProps> = memo(function Box({ name, type, component }) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type,
      item: { name, component },
      collect: (monitor) => ({
        isDragging:monitor.isDragging()
      }),
      end:({},monitor)=>{
        console.log(monitor.didDrop())
      },
    }),
    [name, type],
  )


  return (
    <div ref={drag} style={{cursor:isDragging?"move":"move"}}>
          {component}
    </div>
  )
})
