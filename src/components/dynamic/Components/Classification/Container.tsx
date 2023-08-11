import type { FC } from 'react'
import { memo, useCallback, useState } from 'react'

import { Box } from './Box'
import { Dustbin, DustbinProps } from './Dustbin'
import { ItemTypes } from './ItemTypes'
import Shapes from '../../Shapes'

interface DustbinState {
    accepts: string[]
    lastDroppedItem: any
}

interface BoxState {
    name: string
    type: string
}

export interface DustbinSpec {
    accepts: string[],
    components: React.ReactNode[]
}
export interface BoxSpec {
    name: string
    type: string
}
export interface ContainerState {
    droppedBoxNames: string[]
    dustbins: DustbinSpec[]
    boxes: BoxSpec[]
}

export const Container: FC = memo(function Container() {
    const [dustbins, setDustbins] = useState<DustbinSpec[]>([
        { accepts: [ItemTypes.Triangle], components: [] },
        { accepts: [ItemTypes.Square], components: [] },
        { accepts: [ItemTypes.Circle], components: [] },
    ])

    const [boxes, setBoxes] = useState<BoxState[]>([
        { name: 'Square', type: ItemTypes.Square},
        { name: 'Circle', type: ItemTypes.Circle },
        { name: 'Triangle', type: ItemTypes.Triangle },
    ])


    const handleDrop = useCallback(
        (index: number, item: { name: string, component:React.ReactNode }) => {
            const { name, component } = item
            setBoxes((boxes) => boxes.filter(b => b.name !== name))
            setDustbins((dustbins) => {
                dustbins[index].components = [...dustbins[index].components, item.component]
                return dustbins
            }
            )
        },
        [],
    )

    return (
        <div>
            <div className='flex justify-center gap-2 p-3 bg-white rounded-xl mb-2'>
                {dustbins.map(({ accepts, components }, index) => (
                    <Dustbin
                        accept={accepts}
                        onDrop={(item) => handleDrop(index, item)}
                        components={components}
                        key={index}
                    />
                ))}
            </div>

            <div className='flex justify-center gap-3 p-3 bg-white rounded-xl'>
                {boxes.map(({ name, type }, index) => (
                    <Box
                        name={name}
                        type={type}
                        component={<Shapes properties={["square", "red", "50"]} iconOnly />}
                        key={index}
                    />
                ))}
            </div>
        </div>
    )
})
