import { rndItem } from '@/helpers/random';
import { BsCircleFill } from 'react-icons/bs'
import { FaSquareFull, FaHeart } from 'react-icons/fa'
import { IoCaretUpSharp, IoStar } from 'react-icons/io5'

export type ShapesTypes = 'square' | 'triangle' | 'circle' | 'heart' | 'rectangle' | 'star'

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

export interface ShapesProps {
    shape?: string
    color?: string
    size?: string
    iconOnly?: string
    name?: string // for components used in classification
}
export default function Shapes(props: ShapesProps) {
    if (props.name) props.shape = props.name;
    const shape = props.shape || rndItem(shapesNames);
    let color = props.color || rndItem(colors);
    const size = Number(props.size) || rndItem(sizes)
    const iconOnly = Boolean(props.iconOnly) || false

    let shapeIcon = () => {
        if (shape == 'square') {
            return <FaSquareFull size={size} style={{ color: color }} />
        }
        else if (shape == 'triangle') {
            return <IoCaretUpSharp size={size} style={{ color: color, transform: "scaleX(150%) scaleY(200%)" }} />
        }
        else if (shape == 'circle') {
            return <BsCircleFill size={size} style={{ color: color }} />
        }
        else if (shape == 'heart') {
            return <FaHeart size={size} style={{ color: color }} />
        }
        else if (shape == 'rectangle') {
            return <FaSquareFull size={size} style={{ color: color, transform: "scaleX(120%) scaleY(80%)" }} />
        }
        else if (shape == 'star') {
            return <IoStar size={size} style={{ color: color }} />
        }
    };

    if (iconOnly) {
        return shapeIcon()
    }

    return (
        <div className={`p-10 rounded-lg flex justify-center bg-white`}>
            {shapeIcon()}
        </div>
    )
}