import { Container } from "./Components/Classification/Container"

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'


export interface ClassificationProps {
    properties: string[] //Properties are an array of 
}

export default function Classification({ properties }: ClassificationProps) {
    return (
        <DndProvider backend={HTML5Backend}>
            <Container />
        </DndProvider>
    )
}