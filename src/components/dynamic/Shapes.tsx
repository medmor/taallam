import { BsCircleFill } from 'react-icons/bs'
import { FaSquareFull, FaHeart } from 'react-icons/fa'
import { IoCaretUpSharp, IoStar } from 'react-icons/io5'

export interface ShapesProps {
    properties: string[]
}
export default function Shapes({ properties }: ShapesProps) {
    const shape = properties[0];
    let color = properties[1];
    const size = Number(properties[2])



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


    return (
        <div className={`p-10 rounded-lg flex justify-center bg-white`}>
            {shapeIcon()}
        </div>
    )
}