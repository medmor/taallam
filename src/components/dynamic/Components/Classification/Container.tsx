import type { FC } from 'react'
import { memo, useCallback, useState } from 'react'

import { Box } from './Box'
import { Dustbin, DustbinProps } from './Dustbin'
import { ItemTypes } from './ItemTypes'

interface DustbinState {
    accepts: string[]
    lastDroppedItem: any
}

interface BoxState {
    name: string
    type: string
}

export interface DustbinSpec {
    accepts: string[]
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
        { accepts: [ItemTypes.Triangle] },
        { accepts: [ItemTypes.Square] },
        { accepts: [ItemTypes.Circle], },
    ])

    const [boxes] = useState<BoxState[]>([
        { name: 'Square', type: ItemTypes.Square },
        { name: 'Circle', type: ItemTypes.Circle },
        { name: 'Triangle', type: ItemTypes.Triangle },
    ])

    const [droppedBoxNames, setDroppedBoxNames] = useState<string[]>([])

    function isDropped(boxName: string) {
        return droppedBoxNames.indexOf(boxName) > -1
    }

    const handleDrop = useCallback(
        (index: number, item: { name: string }) => {
            const { name } = item
            setDroppedBoxNames((droppedBoxNames) => name ? [...droppedBoxNames, name] : [...droppedBoxNames])
            setDustbins((dustbins) => {
                return dustbins
            }
            )
        },
        [],
    )

    return (
        <div>
            <div className='flex justify-center gap-2 p-3 bg-white rounded-xl mb-2'>
                {dustbins.map(({ accepts }, index) => (
                    <Dustbin
                        accept={accepts}
                        onDrop={(item) => handleDrop(index, item)}
                        key={index}
                    />
                ))}
            </div>

            <div className='flex justify-center gap-3 p-3 bg-white rounded-xl'>
                {boxes.map(({ name, type }, index) => (
                    <Box
                        name={name}
                        type={type}
                        isDropped={isDropped(name)}
                        key={index}
                    />
                ))}
            </div>
        </div>
    )
})
