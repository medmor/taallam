import { useCallback, useRef, useState } from "react"
import MiniGame from "./MiniGame"
import { oneDTo2D, twoDTo1D, swap } from "@/helpers/array"
import { Directions } from "@/types/Directions"
import { animated, easings, useSpring } from '@react-spring/web'

const SlideDuration = 200;

interface SlidingPuzzleProps {
    items: string[]
}

const SlidingPuzzle = (props: SlidingPuzzleProps) => {
    const gridSize = Math.sqrt(props.items.length)

    const freeCell = props.items[props.items.length - 1]

    const [items, setItems] = useState(     props.items    )

    return (
        // <MiniGame saveKey={"SlidingPuzzle"+props.items.toString()}>
        <div className={`grid grid-cols-${gridSize} w-[300px] h-[300px] m-auto gap-3`}>
            {items.map((item, i) => (
                <CellComponent key={i} index={i} item={item} items={items} setItems={setItems} freeItem={freeCell} gridSize={gridSize} />
            ))}
        </div>
        // </MiniGame>
    )
}
export default SlidingPuzzle

////////////////////////////////////////Cell Component

interface CellComponentProps {
    index: number
    item:string
    items: string[]
    setItems: any
    freeItem: string
    gridSize: number
}
const CellComponent = (props: CellComponentProps) => {
    
    const coordinates = oneDTo2D(props.index, props.gridSize)
    const divRef = useRef(null)
    const [springs, api] = useSpring(() => ({
        from: { x: 0, y: 0, scale: 1 },
        config: { duration: SlideDuration, easing: easings.easeInBack }
    }))
    const onSlideEnd = useCallback((dir: Directions) => {
        api.set({})
        switch (dir) {
            case 'bottom':
                props.setItems((cells: any) => swapBottom(cells, coordinates.x, coordinates.y, props.gridSize))
                break
            case 'left':
                props.setItems((cells: any) => swapLeft(cells,coordinates.x, coordinates.y, props.gridSize))
                break
            case 'right':
                props.setItems((cells: any) => swapRight(cells, coordinates.x, coordinates.y, props.gridSize))
                break
            case 'top':
                props.setItems((cells: any) => swapTop(cells, coordinates.x, coordinates.y, props.gridSize))
                break
        }
    }, [props, api,coordinates.x, coordinates.y])

    const slideDir = useCallback((): Directions | undefined => {
        if (
            coordinates.x < props.gridSize - 1
            && props.items[(twoDTo1D(coordinates.x + 1, coordinates.y, props.gridSize))] == props.freeItem
        ) {
            return 'right';
        }
        else if (
            coordinates.x > 0
            && props.items[(twoDTo1D(coordinates.x - 1, coordinates.y, props.gridSize))] == props.freeItem
        ) {
            return 'left'
        }
        else if (
            coordinates.y < props.gridSize - 1
            && props.items[(twoDTo1D(coordinates.x, coordinates.y + 1, props.gridSize))] == props.freeItem
        ) {
            return 'bottom'
        } else if (
            coordinates.y > 0
            && props.items[(twoDTo1D(coordinates.x, coordinates.y - 1, props.gridSize))] == props.freeItem
        ) {
            return 'top'
        }
    }, [props, coordinates.x, coordinates.y])
    const handleCellClick = useCallback(() => {
        const dir = slideDir()
        let toX = 0, toY = 0;
        if (!dir) {
            return
        }
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
            to: [{ x: toX, y: toY }, {x:0, y:0}],
        })
        setTimeout(() => {
            onSlideEnd(dir)
        }, SlideDuration-10);
    }, [api, onSlideEnd, slideDir])

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
                    ${props.freeItem == props.item ? "opacity-0" : ""}
                    `}
            onClick={() => handleCellClick()}
        >
            {props.item}
        </animated.div>
    )
}

//////////////////////////////////////////Model

//////////////////////////////////////////Helpers
function swapBottom(cells: string[], x:number, y:number, gridSize: number) {
    return [
        ...swap(
            cells,
            twoDTo1D(x, y, gridSize),
            twoDTo1D(x, y + 1, gridSize)
        )
    ]
}
function swapTop(cells: string[], x:number, y:number, gridSize: number) {
    return [
        ...swap(
            cells,
            twoDTo1D(x, y, gridSize),
            twoDTo1D(x, y - 1, gridSize)
        )
    ]
}
function swapLeft(cells: string[], x:number, y:number, gridSize: number) {
    return [
        ...swap(
            cells,
            twoDTo1D(x, y, gridSize),
            twoDTo1D(x - 1, y, gridSize)
        )
    ]
}
function swapRight(cells: string[], x:number, y:number, gridSize: number) {
    return [
        ...swap(
            cells,
            twoDTo1D(x, y, gridSize),
            twoDTo1D(x + 1, y, gridSize)
        )
    ]
}