'use client'
import { useCallback, useEffect, useRef, useState, memo } from "react"
import MiniGame, { MiniGameHandle } from "./MiniGame"
import Droppable from "./DragDrop/Droppable"
import Draggable from "./DragDrop/Draggable"
import { rnd, rndItem } from "@/helpers/random"
import { useTranslations } from "next-intl"
import _Loader from "./_Loader"
import Script from "next/script"

export interface ClassificationProps {
    containersNames: string
    containersCount: string
    itemComponent: string
    itemComponentProps: string
    propToChange: string
}

export default function Classification(props: ClassificationProps) {
    const [contsNames] = useState(props.containersNames.split(","))
    const [contsCount] = useState(props.containersCount.split(",").map(n => Number(n)))
    const [itemComp] = useState(props.itemComponent)
    const [itemCompProps] = useState(props.itemComponentProps)
    const [propToChange] = useState(props.propToChange)

    const t = useTranslations("shapes")
    const miniGameRef = useRef<MiniGameHandle>(null)
    const [containers, setContainers] = useState<any[]>([])
    const [items, setItems] = useState<any[]>([])
    const [currentItem, setCurrentItem] = useState<{ name: string, component: React.ReactNode }>()

    const reset = useCallback(() => {
        const numberOfContainers = rnd(contsCount[0], contsCount[1]);
        const names: string[] = [];
        for (let i = 0; i < numberOfContainers; i++) {
            let name = rndItem(contsNames);
            while (names.includes(name)) {
                name = rndItem(contsNames);
            }
            names.push(name);
        }
        setContainers(generateContainers(names))
        setItems(generateItems(names, numberOfContainers * rnd(2, 4), itemComp, itemCompProps, propToChange))
    }, [contsCount, contsNames, itemComp, itemCompProps, propToChange])

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
                    {items.map((item, index) => (
                        <Draggable clasName="cursor-move" key={item.name} onDragStart={(e) => setCurrentItem(item)}>
                            {item.component}
                        </Draggable>
                    ))}
                </div>
            </div>
            {(navigator.maxTouchPoints ||
                'ontouchstart' in document.documentElement) && (
                    <Script src="/DragDropTouch.js" />
                )}
        </MiniGame>
    )
}

///********************************************************* Model */


const generateContainers = (names: string[]) =>
    names.map((name) => new ContainerModel(name, []));

export function generateItems(names: string[], count: number, component: string, componentProperties: any, propToChange: string) {
    const boxes = [];
    for (let i = 0; i < count; i++) {
        const name: string = rndItem(names)
        componentProperties[propToChange] = name
        boxes.push(
            new ItemModel(
                name + i,
                <_Loader component={component} properties={{ ...componentProperties }} noLoading={true}></_Loader>
            )
        );
    }
    return boxes;
}

// export function generateDndModel(containersCount:number[], containersNames:string[], itemComponentName:string) {
//     const numberOfContainers = rnd(containersCount[0], containersCount[1]);
//     const names: string[] = [];
//     for (let i = 0; i < numberOfContainers; i++) {
//         let name = rndItem(containersNames);
//         while (names.includes(name)) {
//             name = rndItem(containersNames);
//         }
//         names.push(name);
//     }
//     return new DndModel(
//         generateContainers(names),
//         generateItems(names, numberOfContainers * rnd(2, 4), "shapes", [])
//     );
// }

export class DndModel {
    constructor(public containers: ContainerModel[], public items: ItemModel[]) { }
}
export class ContainerModel {
    constructor(public name: string, public components: React.ReactNode[]) { }
}
export class ItemModel {
    constructor(public name: string, public component: React.ReactNode) { }
}


