'use client'
import { useCallback, useEffect, useRef, useState } from "react"
import MiniGame, { MiniGameHandle } from "../Shared/MiniGame"
import Droppable from "../Shared/DragDrop/Droppable"
import Draggable from "../Shared/DragDrop/Draggable"
import { rnd, rndItem } from "@/helpers/random"
import { useTranslations } from "next-intl"
import _Loader from "./_Loader"



export interface ClassificationProps {
    properties: string[] //Properties are an array of 
}

export default function Classification({ properties }: ClassificationProps) {
    const [containersNames] = useState(properties[0].split(","))
    const [containersCount] = useState(properties[1].split(",").map(n=>Number(n)))
    const [itemComponent]  = useState( properties[2])
    const [itemComponentProperties] = useState( properties.slice(3))
    const t = useTranslations("shapes")
    const miniGameRef = useRef<MiniGameHandle>(null)
    const [containers, setContainers] = useState<any[]>([])
    const [items, setItems] = useState<any[]>([])
    const [currentItem, setCurrentItem] = useState<{ name: string, component: React.ReactNode }>()
    
    const reset = useCallback(() => {
        const numberOfContainers = rnd(containersCount[0], containersCount[1]);
        const names: string[] = [];
        for (let i = 0; i < numberOfContainers; i++) {
            let name = rndItem(containersNames);
            while (names.includes(name)) {
                name = rndItem(containersNames);
            }
            names.push(name);
        }console.log(2)
        setContainers(generateContainers(names))
        setItems(generateItems(names, numberOfContainers * rnd(2, 4), itemComponent, itemComponentProperties))
    }, [containersCount, containersNames,itemComponent, itemComponentProperties])
    
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


const generateContainers = (names: string[]) =>
    names.map((name) => new ContainerModel(name, []));

export function generateItems(names: string[], count: number, component:string, componentProperties:string[]) {
    const boxes = [];
    for (let i = 0; i < count; i++) {
        const name = rndItem(names);
        boxes.push(
            new ItemModel(
                name + i,
                <_Loader component={component} properties={componentProperties}></_Loader>
            )
        );
    }
    return boxes;
}

export function generateDndModel(containersCount:number[], containersNames:string[], itemComponentName:string) {
    const numberOfContainers = rnd(containersCount[0], containersCount[1]);
    const names: string[] = [];
    for (let i = 0; i < numberOfContainers; i++) {
        let name = rndItem(containersNames);
        while (names.includes(name)) {
            name = rndItem(containersNames);
        }
        names.push(name);
    }
    return new DndModel(
        generateContainers(names),
        generateItems(names, numberOfContainers * rnd(2, 4), "shapes", [])
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


