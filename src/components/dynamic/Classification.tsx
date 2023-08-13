'use client'
import { useEffect } from "react"
import { Container } from "./Components/Classification/Container"

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'



export interface ClassificationProps {
    properties: string[] //Properties are an array of 
}

export default function Classification({ properties }: ClassificationProps) {

    useEffect(()=>{
        if (isTouchDevice()) {
            const script = document.createElement("script");
            script.setAttribute("src", "/lib/js/dragdrop.js");
            document.body.appendChild(script);
          }
    },[])

    return (
        <DndProvider backend={HTML5Backend}>
            <Container />
        </DndProvider>
    )
}

function isTouchDevice() {
    return navigator.maxTouchPoints || "ontouchstart" in document.documentElement
}