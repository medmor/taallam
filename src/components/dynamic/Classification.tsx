'use client'
import { useCallback, useEffect, useRef, useState } from "react"
import MiniGame, { MiniGameHandle } from "../Shared/MiniGame"
import Droppable from "../Shared/DragDrop/Droppable"
import Draggable from "../Shared/DragDrop/Draggable"
import Shapes, { ShapesTypes } from "./Shapes"
import { rnd, rndItem } from "@/helpers/random"
import { useTranslations } from "next-intl"



export interface ClassificationProps {
    properties: string[] //Properties are an array of 
}

export default function Classification({ properties }: ClassificationProps) {

    const t = useTranslations("shapes")
    const miniGameRef = useRef<MiniGameHandle>(null)
    const [containers, setContainers] = useState<any[]>([])
    const [items, setItems] = useState<any[]>([])
    const [currentItem, setCurrentItem] = useState<{ name: string, component: React.ReactNode }>()

    const reset = useCallback(() => {
        let dndModel = generateDndModel()
        setContainers(dndModel.containers)
        setItems(dndModel.items)
    }, [])

    const handleDrop = useCallback(
        (index: number) => {
            if (currentItem?.name.startsWith(containers[index].name)) {
                setItems((boxes) => {
                    let bx = boxes.filter(b => b.name !== currentItem.name)
                    if (bx.length == 0) {
                        setTimeout(() => {
                            reset()
                        }, 200);
                    }
                    return bx
                })
                setContainers((dustbins) => {
                    dustbins[index].components = [...dustbins[index].components, currentItem?.component]
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
        [containers, currentItem, reset],
    )

    useEffect(() => {
        reset();
        if (isTouchDevice()) {
            const script = document.createElement("script");
            script.setAttribute("src", "/lib/js/dragdrop.js");
            document.body.appendChild(script);
        }
    }, [reset])

    return (
        <MiniGame saveKey='classificationBestScore' onTimeEnd={reset} ref={miniGameRef}>
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
                                min-w-[auto] 
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
                    {items.map((item, index) => (
                        <Draggable clasName="cursor-move" key={index} onDragStart={(e) => setCurrentItem(item)}>
                            {item.component}
                        </Draggable>
                    ))}
                </div>
            </div>
        </MiniGame>
    )
}

function isTouchDevice() {
    return navigator.maxTouchPoints || "ontouchstart" in document.documentElement
}


///********************************************************* Model */
export const shapesNames: ShapesTypes[] = [
    "circle",
    "heart",
    "rectangle",
    "square",
    "star",
    "triangle",
];
const colors = ["red", "blue", "yellow", "purple", "green", "orange", "black"];
const sizes = [20, 24, 28, 32];

const generateContainers = (names: string[]) =>
    names.map((name) => new ContainerModel(name, []));

export function generateItems(names: string[], count: number) {
    const boxes = [];
    for (let i = 0; i < count; i++) {
        const name = rndItem(names);
        const color = rndItem(colors);
        const size = rndItem(sizes);
        boxes.push(
            new ItemModel(
                name + i,
                Shapes({ properties: [name, color, size], iconOnly: true })
            )
        );
    }
    return boxes;
}

export function generateDndModel() {
    const numberOfContainers = rnd(2, 4);
    const names: ShapesTypes[] = [];
    for (let i = 0; i < numberOfContainers; i++) {
        let name = rndItem(shapesNames);
        while (names.includes(name)) {
            name = rndItem(shapesNames);
        }
        names.push(name);
    }
    return new DndModel(
        generateContainers(names),
        generateItems(names, numberOfContainers * rnd(2, 4))
    );
}

export class DndModel {
    constructor(public containers: ContainerModel[], public items: ItemModel[]) { }
}
export class ContainerModel {
    constructor(public name: string, public components: React.ReactNode[]) { }
}

export class ItemModel {
    constructor(public name: string, public component: React.ReactNode) { }
}


