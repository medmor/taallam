import type { CSSProperties, FC } from 'react'
import { memo } from 'react'
import { useDrag } from 'react-dnd'
import Shapes from '../../Shapes'

export interface BoxProps {
  name: string
  type: string
  isDropped: boolean
}

export const Box: FC<BoxProps> = memo(function Box({ name, type, isDropped }) {
  const [{ opacity }, drag] = useDrag(
    () => ({
      type,
      item: { name },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.4 : 1,
      }),
    }),
    [name, type],
  )

  return (
    <div ref={drag} className=''>
          <Shapes properties={["square", "red", "50"]} iconOnly />
    </div>
  )
})
