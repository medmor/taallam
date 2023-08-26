import { DireactionsArray, Directions } from "@/types/Directions";
import { rnd, rndItem } from "./random";

export const oneDTo2D = (
  index: number,
  size: number
): { x: number; y: number } => ({
  x: index % size,
  y: Math.floor(index / size),
});

export const twoDTo1D = (x: number, y: number, size: number): number =>
  y * size + x;

export const swap = (array: string[], index1: number, index2: number) => {
  [array[index1], array[index2]] = [array[index2], array[index1]];
  return array;
};

export const suffle = (
  array: string[],
  freeItemIndex: number,
  gridSize: number
) => {
  for (let i = 0; i < 100; i++) {
    const rndDir: Directions = rndItem(DireactionsArray);
    const freeItemXY = oneDTo2D(freeItemIndex, gridSize);
    let toSwap = -1;
    switch (rndDir) {
      case "left":
        if (freeItemXY.x > 0) {
          toSwap = twoDTo1D(freeItemXY.x - 1, freeItemXY.y, gridSize);
          array = swap(array, freeItemIndex, toSwap);
          freeItemIndex = toSwap;
        }
        break;
      case "right":
        if (freeItemXY.x < gridSize-1) {
          toSwap = twoDTo1D(freeItemXY.x + 1, freeItemXY.y, gridSize);
          array = swap(array, freeItemIndex, toSwap);
          freeItemIndex = toSwap;
        }
        break;
      case "bottom":
        if (freeItemXY.y < gridSize-1) {
          toSwap = twoDTo1D(freeItemXY.x, freeItemXY.y + 1, gridSize);
          array = swap(array, freeItemIndex, toSwap);
          freeItemIndex = toSwap;
        }

        break;
      case "top":
        if (freeItemXY.y > 0) {
          toSwap = twoDTo1D(freeItemXY.x, freeItemXY.y - 1, gridSize);
          array = swap(array, freeItemIndex, toSwap);
          freeItemIndex = toSwap;
        }

        break;
    }
  }
  return array;
};
