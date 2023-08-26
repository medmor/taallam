'use client'
import { useCallback, useEffect, useRef, useState } from "react"
import MiniGame, { MiniGameHandle } from "./MiniGame"
import { oneDTo2D, twoDTo1D, swap, suffle } from "@/helpers/array"
import { Directions } from "@/types/Directions"
import { animated, easings, useSpring } from '@react-spring/web'

const SlideDuration = 200;

interface SlidingPuzzleProps {
    items: string[]
}

const SlidingPuzzle = (props: SlidingPuzzleProps) => {
    const miniGameRef = useRef<MiniGameHandle>(null)
    const gridSize = Math.sqrt(props.items.length)
    const freeItem = props.items[props.items.length - 1]
    const initialState = [...props.items]
    const [items, setItems] = useState<string[]>([])

    const checkWin = ()=> {
        if(initialState.every((item, i)=>item==items[i])){
            miniGameRef.current?.callEndGame()
        }
    }

    const swapItems = (dir:Directions, x:number, y:number)=> { // change x and y to index only
        switch (dir) {
            case 'bottom':
                setItems((cells: any) => swapBottom(cells, x, y, gridSize))
                break
            case 'left':
                setItems((cells: any) => swapLeft(cells, x, y, gridSize))
                break
            case 'right':
                setItems((cells: any) => swapRight(cells, x, y, gridSize))
                break
            case 'top':
                setItems((cells: any) => swapTop(cells, x, y, gridSize))
                break
        }
        checkWin()
    }

    const getSlideDirection = useCallback((x:number, y:number): Directions | undefined => {
        if (
            x < gridSize - 1
            && items[(twoDTo1D(x + 1, y, gridSize))] == freeItem
        ) {
            return 'right';
        }
        else if (
            x > 0
            && items[(twoDTo1D(x - 1, y, gridSize))] == freeItem
        ) {
            return 'left'
        }
        else if (
            y < gridSize - 1
            && items[(twoDTo1D(x, y + 1, gridSize))] == freeItem
        ) {
            return 'bottom'
        } else if (
            y > 0
            && items[(twoDTo1D(x, y - 1, gridSize))] == freeItem
        ) {
            return 'top'
        }
    }, [freeItem, items, gridSize])

    useEffect(() => {
        setItems([...suffle(props.items, props.items.length - 1, gridSize)])
    }, [])
    return (
        <MiniGame saveKey={"SlidingPuzzle" + props.items.toString()} hideScore countdown={60000} ref={miniGameRef}>
            <div className={`grid grid-cols-${gridSize} w-[300px] h-[300px] m-auto gap-3`}>
                {items.map((item, i) => {
                    const {x, y} = oneDTo2D(i, gridSize)
                    const slideDir = getSlideDirection(x, y)
                    return (
                    <ItemComponent 
                    key={i} 
                    item={item} 
                    slidDirection={slideDir}
                    onSlideEnd={()=>swapItems(slideDir as Directions, x, y)}  
                    hiden={item==freeItem}
                    />
                    )
})}
            </div>
        </MiniGame>
    )

}
export default SlidingPuzzle

////////////////////////////////////////Cell Component

interface ItemComponentProps {
    item: string
    hiden?:boolean
    slidDirection:Directions|undefined
    onSlideEnd:()=>void
}
const ItemComponent = (props: ItemComponentProps) => {

    const divRef = useRef(null)
    const [springs, api] = useSpring(() => ({
        from: { x: 0, y: 0, scale: 1 },
        config: { duration: SlideDuration, easing: easings.easeInBack }
    }))
    const onSlideEnd = useCallback((dir: Directions) => {
        api.set({})
        props.onSlideEnd()
    }, [api, props])


    const handleCellClick = useCallback(() => {
        const dir = props.slidDirection
        if (!dir) {
            return
        }
        let toX = 0, toY = 0;
        switch (dir) {
            case 'bottom':
                toY = 100
                break
            case 'left':
                toX = -100
                break
            case 'right':
                toX = 100
                break
            case 'top':
                toY = -100
                break
        }
        api.start({
            from: { x: 0, y: 0 },
            to: [{ x: toX, y: toY }, { x: 0, y: 0 }],
        })
        setTimeout(() => {
            onSlideEnd(dir)
        }, SlideDuration - 10);
    }, [api, onSlideEnd, props])

    return (
        <animated.div
            ref={divRef}
            style={{
                ...springs
            }}
            className={`
                    bg-indigo-500
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    text-4xl
                    font-bold
                    cursor-pointer
                    select-none
                    ${props.hiden ? "opacity-0" : ""}
                    `}
            onClick={() => handleCellClick()}
        >
            {props.item}
        </animated.div>
    )
}

//////////////////////////////////////////Model

//////////////////////////////////////////Helpers
function swapBottom(cells: string[], x: number, y: number, gridSize: number) {
    return [
        ...swap(
            cells,
            twoDTo1D(x, y, gridSize),
            twoDTo1D(x, y + 1, gridSize)
        )
    ]
}
function swapTop(cells: string[], x: number, y: number, gridSize: number) {
    return [
        ...swap(
            cells,
            twoDTo1D(x, y, gridSize),
            twoDTo1D(x, y - 1, gridSize)
        )
    ]
}
function swapLeft(cells: string[], x: number, y: number, gridSize: number) {
    return [
        ...swap(
            cells,
            twoDTo1D(x, y, gridSize),
            twoDTo1D(x - 1, y, gridSize)
        )
    ]
}
function swapRight(cells: string[], x: number, y: number, gridSize: number) {
    return [
        ...swap(
            cells,
            twoDTo1D(x, y, gridSize),
            twoDTo1D(x + 1, y, gridSize)
        )
    ]
}