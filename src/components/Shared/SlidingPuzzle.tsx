"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import MiniGame, { MiniGameHandle } from "./MiniGame";
import { oneDTo2D, twoDTo1D, swap, suffle } from "@/helpers/array";
import { Directions } from "@/types/Directions";
import Image from "next/image";
import { useLocale } from "next-intl";

const SlideDuration = 200;

interface SlidingPuzzleProps {
  items: string[];
}

const SlidingPuzzle = (props: SlidingPuzzleProps) => {
  const locale = useLocale();
  const miniGameRef = useRef<MiniGameHandle>(null);
  const gridSize = Math.sqrt(props.items.length);
  const [freeItem, setFreeItem] = useState(props.items[props.items.length - 1]);
  const initialState = [...props.items];
  const [items, setItems] = useState<string[]>([]);
  const [loseAudio, setLoseAudio] = useState<HTMLAudioElement>();
  const [winAudio, setWinAudi] = useState<HTMLAudioElement>();
  const [slideAudio, setSlideAudio] = useState<HTMLAudioElement>();
  const [showWinGif, setShwoWinGif] = useState(false);

  const checkWin = () => {
    if (initialState.every((item, i) => item == items[i])) {
      miniGameRef.current?.stopCounter();
      winAudio?.play();
      setFreeItem("none");
      setShwoWinGif(true);
      setTimeout(() => {
        miniGameRef.current?.callEndGame();
      }, 5000);
    }
  };

  const swapItems = (dir: Directions, x: number, y: number) => {
    switch (dir) {
      case "bottom":
        setItems(swapBottom(items, x, y, gridSize));
        break;
      case "left":
        setItems(swapLeft(items, x, y, gridSize));
        break;
      case "right":
        setItems(swapRight(items, x, y, gridSize));
        break;
      case "top":
        setItems(swapTop(items, x, y, gridSize));
        break;
    }
    checkWin();
  };

  const getSlideDirection = useCallback(
    (x: number, y: number): Directions | undefined => {
      if (x < gridSize - 1 && items[twoDTo1D(x + 1, y, gridSize)] == freeItem) {
        return "right";
      } else if (x > 0 && items[twoDTo1D(x - 1, y, gridSize)] == freeItem) {
        return "left";
      } else if (
        y < gridSize - 1 &&
        items[twoDTo1D(x, y + 1, gridSize)] == freeItem
      ) {
        return "bottom";
      } else if (y > 0 && items[twoDTo1D(x, y - 1, gridSize)] == freeItem) {
        return "top";
      }
    },
    [freeItem, items, gridSize],
  );

  const reset = useCallback(() => {
    setItems([...suffle([...props.items], props.items.length - 1, gridSize)]);
    setFreeItem(props.items[props.items.length - 1]);
    setShwoWinGif(false);
  }, [gridSize, props.items]);

  useEffect(() => {
    setWinAudi(new Audio("/audios/effects/applause.mp3"));
    setLoseAudio(new Audio("/audios/effects/lose.mp3"));
    setSlideAudio(new Audio("/audios/effects/slide.mp3"));
  }, []);

  return (
    <MiniGame
      saveKey={"SlidingPuzzle" + props.items.toString()}
      hideScore
      countdown={200000}
      ref={miniGameRef}
      onStart={() => reset()}
      onGameEnded={() => {
        if (!showWinGif) loseAudio?.play();
      }}
    >
      <div
        className={`grid grid-cols-${gridSize} m-auto h-[300px] w-[300px] gap-3`}
        dir={locale == "en" || locale == "fr" ? "ltr" : "rtl"}
      >
        {showWinGif && (
          <Image
            src="/images/win.gif"
            alt="win gif"
            className="absolute left-0 top-0 h-full w-full"
            width={300}
            height={300}
          />
        )}

        {items.map((item, i) => {
          const { x, y } = oneDTo2D(i, gridSize);
          const slideDir = getSlideDirection(x, y);
          return (
            <ItemComponent
              key={i}
              item={item}
              slidDirection={slideDir}
              onSlideEnd={() => swapItems(slideDir as Directions, x, y)}
              hiden={item == freeItem}
              slideAudio={slideAudio as HTMLAudioElement}
            />
          );
        })}
      </div>
    </MiniGame>
  );
};
export default SlidingPuzzle;

////////////////////////////////////////Cell Component

interface ItemComponentProps {
  item: string;
  hiden?: boolean;
  slidDirection: Directions | undefined;
  onSlideEnd: () => void;
  slideAudio: HTMLAudioElement;
}
const ItemComponent = (props: ItemComponentProps) => {
  const divRef = useRef(null);
  // const [springs, api] = useSpring(() => ({
  //     from: { x: 0, y: 0, scale: 1 },
  //     config: { duration: SlideDuration, easing: easings.easeInBack }
  // }))
  const onSlideEnd = useCallback(() => {
    // api.set({})
    props.onSlideEnd();
  }, [/*api, */ props]);

  const handleCellClick = useCallback(() => {
    const dir = props.slidDirection;
    if (!dir) {
      return;
    }
    props.slideAudio.currentTime = 0;
    props.slideAudio.play();
    // let toX = 0, toY = 0;
    // switch (dir) {
    //     case 'bottom':
    //         toY = 100
    //         break
    //     case 'left':
    //         toX = -100
    //         break
    //     case 'right':
    //         toX = 100
    //         break
    //     case 'top':
    //         toY = -100
    //         break
    // }
    // api.start({
    //     from: { x: 0, y: 0 },
    //     to: [{ x: toX, y: toY }, { x: 0, y: 0 }],
    // })
    // setTimeout(() => {
    onSlideEnd();
    // }, SlideDuration - 10);
  }, [/*api,*/ onSlideEnd, props]);

  return (
    <div
      ref={divRef}
      className={`
                    flex
                    cursor-pointer
                    select-none
                    items-center
                    justify-center
                    rounded-xl
                    bg-cyan-300
                    text-4xl
                    font-bold
                    text-blue-800
                    ${props.hiden ? "opacity-0" : ""}
                    `}
      onClick={() => handleCellClick()}
    >
      {props.item}
    </div>
  );
};

//////////////////////////////////////////Model

//////////////////////////////////////////Helpers
function swapBottom(cells: string[], x: number, y: number, gridSize: number) {
  return [
    ...swap(cells, twoDTo1D(x, y, gridSize), twoDTo1D(x, y + 1, gridSize)),
  ];
}
function swapTop(cells: string[], x: number, y: number, gridSize: number) {
  return [
    ...swap(cells, twoDTo1D(x, y, gridSize), twoDTo1D(x, y - 1, gridSize)),
  ];
}
function swapLeft(cells: string[], x: number, y: number, gridSize: number) {
  return [
    ...swap(cells, twoDTo1D(x, y, gridSize), twoDTo1D(x - 1, y, gridSize)),
  ];
}
function swapRight(cells: string[], x: number, y: number, gridSize: number) {
  return [
    ...swap(cells, twoDTo1D(x, y, gridSize), twoDTo1D(x + 1, y, gridSize)),
  ];
}
