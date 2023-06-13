import { CSSProperties } from "react";

export interface ShapesProps {
    properties: string[]
}
export default function Shapes({ properties }: ShapesProps) {
    const shape = properties[0];
    const color = properties[1];
    const size = Number(properties[2])

    let shapeStyle: CSSProperties = {};
    if (shape == 'square') {
        shapeStyle.width = shapeStyle.height = `${size}px`;
    }
    else if (shape == 'triangle') {
        shapeStyle.width = shapeStyle.height = '0px';
        shapeStyle.borderLeft = shapeStyle.borderRight = `${3 * size / 4}px solid white`
        shapeStyle.borderBottom = `${size}px solid`
    }
    else if (shape == 'circle') {
        shapeStyle.borderRadius = '100%';
        shapeStyle.width = shapeStyle.height = `${size}px`
    }

    if (color == 'red') {
        shapeStyle.background = shapeStyle.borderBottomColor = 'red'
    }
    else if (color == 'green') {
        shapeStyle.background = shapeStyle.borderBottomColor = 'green'
    }
    else if (color == 'blue') {
        shapeStyle.background = shapeStyle.borderBottomColor = 'blue'
    }

    return (
        <div className="p-10 rounded-lg bg-white">
            <div style={shapeStyle}></div>
        </div>
    )
}