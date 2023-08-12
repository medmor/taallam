'use client'
import type { FC } from 'react'
import { memo, useCallback, useMemo, useState } from 'react'

import { Box } from './Box'
import { Dustbin } from './Dustbin'
import { generateDndModel } from './model'


export const Container: FC = memo(function Container() {
    let wrongAudio = useMemo(() => new Audio("/audios/effects/wrong.mp3"), [])
    const goodAudio = useMemo(() => new Audio("/audios/effects/good.mp3"), [])

    const dndModel = generateDndModel()

    const [dustbins, setDustbins] = useState<any[]>(dndModel.dustbins)

    const [boxes, setBoxes] = useState<any[]>(dndModel.boxes)


    const handleDrop = useCallback(
        (index: number, item: { name: string, component: React.ReactNode }) => {
            const { name, component } = item
            if (item.name.startsWith( dustbins[index].name)) {
                setBoxes((boxes) => boxes.filter(b => b.name !== name))
                setDustbins((dustbins) => {
                    dustbins[index].components = [...dustbins[index].components, component]
                    return dustbins
                })
                goodAudio.play();
            }else{
                wrongAudio.play();
            }
        },
        [dustbins, goodAudio, wrongAudio],
    )

    return (
        <div className='bg-white p-2 rounded-xl'>
            <div className='flex flex-wrap justify-center gap-2 p-3 mb-2 border-b-2'>
                {dustbins.map(({components, name }, index) => (
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
    )
})
