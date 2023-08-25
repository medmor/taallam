import { useState } from "react"
import MiniGame from "./MiniGame"
import { oneDTo2D, twoDTo1D } from "@/helpers/array"
import { Directions } from "@/types/Directions"

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

    const handleCellClick = (direction?: Directions) => {
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

    return (
        // <MiniGame saveKey={"SlidingPuzzle"+props.items.toString()}>
        <div className={`grid grid-cols-${gridSize} w-[300px] h-[300px] m-auto gap-3`}>
            {cells.map(cell => (
                cell.item != freeCell && (
                    <div
                        key={cell.item}
                        className="
                    bg-indigo-500
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    text-4xl
                    font-bold
                    cursor-pointer
                    active:animate-bounce
                    "
                        onClick={() => handleCellClick(cell.slideDir(cells, freeCell, gridSize))}
                    >
                        {cell.item}
                    </div>
                )
            ))}
        </div>
        // </MiniGame>
    )
}
export default SlidingPuzzle

//////////////////////////////////////////Model
class Cell {
    constructor(
        public item: string,
        public x: number,
        public y: number
    ) {
    }

    slideDir(cells: Cell[], freeCell: string, size: number): Directions | undefined {
        if (this.x < size - 1 && cells[(twoDTo1D(this.x + 1, this.y, size))].item == freeCell) {
            return 'right';
        } else if (this.x > 0 && cells[(twoDTo1D(this.x - 1, this.y, size))].item == freeCell) {
            return 'left'
        } else if (this.y < size - 1 && cells[(twoDTo1D(this.x, this.y + 1, size))].item == freeCell) {
            return 'bottom'
        } else if (this.y > 0 && cells[(twoDTo1D(this.x, this.y - 1, size))].item == freeCell) {
            return 'top'
        }
    }
}

