'use client'
import { useCallback, useEffect, useRef, useState, memo } from "react"
import MiniGame, { MiniGameHandle } from "./MiniGame"
import Droppable from "./DragDrop/Droppable"
import Draggable from "./DragDrop/Draggable"
import { rnd, rndItem } from "@/helpers/random"
import { useTranslations } from "next-intl"
import _Loader from "./_Loader"
import Script from "next/script"
import Shapes, { colors, shapesNames, sizes } from "./Shapes"

export interface ShapesClassificationProps {

}

export default function ShapesClassification(props: ShapesClassificationProps) {

    const t = useTranslations("shapes")
    const miniGameRef = useRef<MiniGameHandle>(null)
    const [containers, setContainers] = useState<any[]>([])
    const [items, setItems] = useState<any[]>([])
    const [currentItem, setCurrentItem] = useState<{ name: string, component: React.ReactNode }>()
    const [isMobile, setIsMobile] = useState(false)

    const reset = useCallback(() => {
        const numberOfContainers = rnd(2, 4);
        const names: string[] = [];
        for (let i = 0; i < numberOfContainers; i++) {
            let name = rndItem(shapesNames);
            while (names.includes(name)) {
                name = rndItem(shapesNames);
            }
            names.push(name);
        }
        setContainers(generateContainers(names))
        setItems(generateItems(names, numberOfContainers * rnd(2, 4)))
    }, [])

    const handleDrop = useCallback(
        (index: number) => {
            if (currentItem?.name.startsWith(containers[index].name)) {
                setItems((boxes) => {
                    let bx = boxes.filter(b => b.name !== currentItem.name)
                    if (bx.length == 0) {
                        setTimeout(() => {
                            reset()
                        }, 300);
                    }
                    return bx
                })
                setContainers((containers) => {
                    containers[index].components = [...containers[index].components, currentItem?.component]
                    return containers
                })
                miniGameRef.current?.playGoodSound()
                miniGameRef.current?.changeScore(1)
            } else {
                miniGameRef.current?.playWrongSound()
                miniGameRef.current?.changeScore(-1)
                miniGameRef.current?.changeErrors(1);
            }
        },
        [containers, currentItem, reset],
    )

    useEffect(() => {
        reset();
        setIsMobile(navigator.maxTouchPoints > 0 || 'ontouchstart' in document.documentElement)
    }, [reset])

    return (
        <MiniGame saveKey='classificationBestScore' onGameEnded={reset} ref={miniGameRef} countdown={60000}>
            <div className='bg-white p-2 rounded-xl'>
                <div className='flex flex-wrap justify-center gap-2 p-3 mb-2 border-b-2'>
                    {containers.map(({ components, name }, index) => (
                        <Droppable
                            key={name}
                            className="
                                flex 
                                flex-wrap 
                                justify-center 
                                gap-2
                                border-black 
                                border-2 
                                rounded-xl 
                                p-2 
                                min-w-[50px] 
                                min-h-[100px]
                                max-w-[150px]"
                            onDrop={(e) => handleDrop(index)}
                        >
                            {
                                components.length == 0 ? t(name) :
                                    components
                            }
                        </Droppable>
                    ))}
                </div>

                <div className='flex flex-wrap justify-center gap-3 p-3 '>
                    {items.map((item) => (
                        <Draggable clasName="cursor-move" key={item.name} onDragStart={(e) => setCurrentItem(item)}>
                            {item.component}
                        </Draggable>
                    ))}
                </div>
            </div>
            {(isMobile) && (<Script src="/lib/js/DragDropTouch.js" />)}
        </MiniGame>
    )
}

///********************************************************* Model */


const generateContainers = (names: string[]) =>
    names.map((name) => new ContainerModel(name, []));

export function generateItems(names: string[], count: number) {
    const boxes = [];
    for (let i = 0; i < count; i++) {
        const name: string = rndItem(names)
        boxes.push(
            new ItemModel(
                name + i,
                <Shapes shape={name.slice()} color={rndItem(colors)} size={rndItem(sizes)} iconOnly="true"></Shapes>
            )
        );
    }
    return boxes;
}

export class ContainerModel {
    constructor(public name: string, public components: React.ReactNode[]) { }
}
export class ItemModel {
    constructor(public name: string, public component: React.ReactNode) { }
}


