import { ShapesTypes } from "../../Shapes";
import Shapes from "../../Shapes";

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

const generateDustbins = (names: string[]) =>
  names.map((name) => new DustbinModel(name, []));

export function generateBoxes(names: string[], count: number) {
  const boxes = [];
  for (let i = 0; i < count; i++) {
    const name = rndItem(names);
    const color = rndItem(colors);
    const size = rndItem(sizes);
    boxes.push(
      new BoxModel(
        name + i,
        Shapes({ properties: [name, color, size], iconOnly: true })
      )
    );
  }
  return boxes;
}

export function generateDndModel() {
  const numberOfDustbins = rnd(2, 4);
  const names: ShapesTypes[] = [];
  for (let i = 0; i < numberOfDustbins; i++) {
    let name = rndItem(shapesNames);
    while (names.includes(name)) {
      name = rndItem(shapesNames);
    }
    names.push(name);
  }
  return new DndModel(
    generateDustbins(names),
    generateBoxes(names, numberOfDustbins * rnd(4, 6))
  );
}

export class DndModel {
  constructor(public dustbins: DustbinModel[], public boxes: BoxModel[]) {}
}
export class DustbinModel {
  constructor(public name: string, public components: React.ReactNode[]) {}
}

export class BoxModel {
  constructor(public name: string, public component: React.ReactNode) {}
}

const rndItem = (arr: any[]) => arr[rnd(0, arr.length)];
const rnd = (min: number, max: number) => min + Math.floor(Math.random() * max);
