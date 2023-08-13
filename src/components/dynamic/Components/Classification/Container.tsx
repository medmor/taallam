'use client'
import type { FC } from 'react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Box } from './Box'
import { Dustbin } from './Dustbin'
import { generateBoxes, generateDndModel, shapesNames } from './model'
import MiniGame, { MiniGameHandle } from '../Shared/MiniGame'


export const Container: FC = memo(function Container() {

    const miniGameRef = useRef<MiniGameHandle>(null)
    const [dustbins, setDustbins] = useState<any[]>([])
    const [boxes, setBoxes] = useState<any[]>([])

    const reset = useCallback(() => {
        let dndModel = generateDndModel()
        setDustbins(dndModel.dustbins)
        setBoxes(dndModel.boxes)
    }, [])

    const handleDrop = useCallback(
        (index: number, item: { name: string, component: React.ReactNode }) => {
            const { name, component } = item
            if (item.name.startsWith(dustbins[index].name)) {
                setBoxes((boxes) => {
                    let bx = boxes.filter(b => b.name !== name)
                    if (bx.length == 0 || !bx.some(b => dustbins.filter(d => b.name.startsWith(d.name)).length>0)) {
                        bx = generateBoxes(shapesNames, 10)
                    }
                    return bx
                })
                setDustbins((dustbins) => {
                    dustbins[index].components = [...dustbins[index].components, component]
                    return dustbins
                })
                miniGameRef.current?.playGoodSound()
                miniGameRef.current?.changeScore(1)
            } else {
                miniGameRef.current?.playWrongSound()
                miniGameRef.current?.changeScore(-1)
                miniGameRef.current?.changeErrors(1);
            }
        },
        [dustbins],
    )

    useEffect(() => {
        reset();
    }, [reset])

    return (
        <MiniGame saveKey='classificationBestScore' onTimeEnd={reset} ref={miniGameRef}>
            <div className='bg-white p-2 rounded-xl'>
                <div className='flex flex-wrap justify-center gap-2 p-3 mb-2 border-b-2'>
                    {dustbins.map(({ components, name }, index) => (
                        <Dustbin
                            name={name}
                            onDrop={(item) => handleDrop(index, item)}
                            components={components}
                            key={index}
                        />
                    ))}
                </div>

                <div className='flex flex-wrap justify-center gap-3 p-3 '>
                    {boxes.map(({ name, component }, index) => (
                        <Box
                            name={name}
                            component={component}
                            key={index}
                        />
                    ))}
                </div>
            </div>
        </MiniGame>
    )
})
