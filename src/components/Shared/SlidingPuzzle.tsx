import { useState } from "react"
import MiniGame from "./MiniGame"
import { oneDTo2D, twoDTo1D } from "@/helpers/array"
import { Directions } from "@/types/Directions"
import { animated, useSpring } from '@react-spring/web'

interface SlidingPuzzleProps {
    items: string[]
}

const SlidingPuzzle = (props: SlidingPuzzleProps) => {
    const gridSize = Math.sqrt(props.items.length)

    const freeCell = props.items[props.items.length - 1]

    const [cells, setCells] = useState(
        props.items
            .map(
                (item, i) => {
                    const xy = oneDTo2D(i, gridSize)
                    return new Cell(item, xy.x, xy.y)
                }
            )
    )



    return (
        // <MiniGame saveKey={"SlidingPuzzle"+props.items.toString()}>
        <div className={`grid grid-cols-${gridSize} w-[300px] h-[300px] m-auto gap-3`}>
            {cells.map(cell => (
                cell.item != freeCell && (
                    <CellComponent key={cell.item} cell={cell} cells={cells} setCells={setCells} freeCell={freeCell} gridSize={gridSize} />
                )
            ))}
        </div>
        // </MiniGame>
    )
}
export default SlidingPuzzle

////////////////////////////////////////Cell Component

interface CellComponentProps {
    cell: Cell
    cells: Cell[]
    setCells: any
    freeCell: string
    gridSize: number
}
const CellComponent = (props: CellComponentProps) => {

    const [hover, setHover] = useState(false)
    const [direction, setDirection] = useState<Directions>()
    const { x } = useSpring({
        x: hover ? 1 : 0,
        config: { duration: 500 },
    })
    const [springs, api] = useSpring(()=>({
        from: {x:0}
    }))

    const handleCellClick = (direction?: Directions) => {
        api.start({
            from: {
              x: 0,
            },
            to: {
              x: 100,
            },
          })
        if (!direction) {
            return
        }
        //swap
        switch (direction) {
            case 'bottom':
                console.log("slide bottom")
                break
            case 'left':
                console.log("slide left")
                break
            case 'right':
                console.log('slide right')
                break
            case 'top':
                console.log('slide top')
                break
        }
    }

    const slideDir = (): Directions | undefined => {
        if (
            props.cell.x < props.gridSize - 1
            && props.cells[(twoDTo1D(props.cell.x + 1, props.cell.y, props.gridSize))].item == props.freeCell
        ) {
            return 'right';
        }
        else if (
            props.cell.x > 0
            && props.cells[(twoDTo1D(props.cell.x - 1, props.cell.y, props.gridSize))].item == props.freeCell
        ) {
            return 'left'
        }
        else if (
            props.cell.y < props.gridSize - 1
            && props.cells[(twoDTo1D(props.cell.x, props.cell.y + 1, props.gridSize))].item == props.freeCell
        ) {
            return 'bottom'
        } else if (
            props.cell.y > 0
            && props.cells[(twoDTo1D(props.cell.x, props.cell.y - 1, props.gridSize))].item == props.freeCell
        ) {
            return 'top'
        }
    }

    return (
        <animated.div
            onMouseEnter={()=>setHover(hover=>!hover)}
            style={{
                scale: x.to({
                    range: [0, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 1],
                    output: [1, 0.97, 0.9, 1.1, 0.9, 1.1, 1.03, 1],
                }),
                ...springs
            }}
            className="
                    bg-indigo-500
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    text-4xl
                    font-bold
                    cursor-pointer
                    "
            onClick={() => handleCellClick(slideDir())}
        >
            {props.cell.item}
        </animated.div>
    )
}

//////////////////////////////////////////Model
class Cell {
    constructor(
        public item: string,
        public x: number,
        public y: number
    ) {
    }
}

////////////////////////////////////////////Helpers