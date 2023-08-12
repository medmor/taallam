'use client'
import { Container } from "./Components/Classification/Container"

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'



export interface ClassificationProps {
    properties: string[] //Properties are an array of 
}

export default function Classification({ properties }: ClassificationProps) {
    if (isTouchDevice()) {
        return (
            <DndProvider backend={TouchBackend}>
                <Container />
            </DndProvider>
        )
    }
    return (
        <DndProvider backend={HTML5Backend}>
            <Container />
        </DndProvider>
    )
}

function isTouchDevice() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        ((navigator as any).msMaxTouchPoints > 0));
}