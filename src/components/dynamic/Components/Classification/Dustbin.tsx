'use client'
import type { FC } from 'react'
import { memo } from 'react'
import { useDrop } from 'react-dnd'

export const acceptTag = 'classification'

export interface DustbinProps {
  name: string
  onDrop: (item: any) => void,
  components: React.ReactNode[]
}

export const Dustbin: FC<DustbinProps> = memo(function Dustbin({
  name,
  onDrop,
  components
}) {
  const [, drop] = useDrop({
    accept:acceptTag,
    drop: onDrop,
  })


  return (
    <div ref={drop} className='flex flex-wrap justify-center gap-2 border-black border-2 rounded-xl p-2 min-w-[15%] min-h-[100px]'>
      {
        components.length==0?name.toUpperCase():
        components
      }
      
    </div>
  )
})
