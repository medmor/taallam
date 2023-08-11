import { type } from 'os'
import type { FC } from 'react'
import { memo } from 'react'
import { useDrop } from 'react-dnd'


export interface DustbinProps {
  accept: string[]
  onDrop: (item: any) => void
}

export const Dustbin: FC<DustbinProps> = memo(function Dustbin({
  accept,
  onDrop,
}) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept,
    drop: onDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  const isActive = isOver && canDrop

  return (
    <div ref={drop} className='border-black border-2 rounded-xl p-2'>
      Put {accept[0]}s here
    </div>
  )
})
