import { DireactionsArray, Directions } from "@/types/Directions";
import { rnd, rndItem } from "./random";

export const oneDTo2D = (index: number, size: number) => ({
  x: index % size,
  y: Math.floor(index / size),
});

export const twoDTo1D = (x: number, y: number, size: number) => y * size + x;

export const swap = (array:string[], index1:number, index2:number) => {
  [array[index1], array[index2]] = [array[index2], array[index1]];
  return array
};

export const suffle = (array:string[], freeItemIndex:number, gridSize: number)=>{
  for(let i = 0; i < 100; i++){
    const rndDir : Directions = rndItem(DireactionsArray)
    const coordinates = oneDTo2D(freeItemIndex, gridSize)
    switch (rndDir) {
      case 'left' : 
        break
        case 'right' :
          break
          case 'bottom':
            break
            case 'top':
              break
    }
  }
}