'use client'
import type { FC } from 'react'
import { memo } from 'react'
import { useDrop } from 'react-dnd'

export const acceptTag = 'classification'

export interface DustbinProps {
  onDrop: (item: any) => void,
  components: React.ReactNode[]
}

export const Dustbin: FC<DustbinProps> = memo(function Dustbin({
  onDrop,
  components
}) {
  const [, drop] = useDrop({
    accept:acceptTag,
    drop: onDrop,
  })


  return (
    <div ref={drop} className='border-black border-2 rounded-xl p-2'>
      {
        components
      }
      
    </div>
  )
})
