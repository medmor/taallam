"use client";

import { useState, useCallback, useMemo, useEffect } from "react";

import { GiSpeaker } from "react-icons/gi";

import Button from "@/components/Shared/Button";
import ContentMedia from "./ContentMedia";
import { usePathname } from "next/navigation";

interface ContentViewerProps {
  medias: any[];
  texts: string[];
  audios: any;
}

export default function Summary({ medias, texts, audios }: ContentViewerProps) {
  const pathname = usePathname();

  const [playTimeout, setPlayTimeout]: any = useState();

  let audio = useMemo(() => {
    if (audios[1] && typeof window !== "undefined") {
      return new Audio(audios[0]);
    }
    return undefined;
  }, [audios]);
  const pause = useCallback(() => {
    if (audio) audio.pause();
  }, [audio]);

  const play = useCallback(
    (index: number) => {
      if (playTimeout != null) {
        clearTimeout(playTimeout);
      }
      if (audio) {
        pause();
        const times = audios[1][index];
        audio.currentTime = times.start;
        audio.play();
        setPlayTimeout(
          setTimeout(
            () => {
              pause();
              setPlayTimeout(null);
            },
            (times.end - times.start) * 1000,
          ),
        );
      }
    },
    [audio, audios, pause, playTimeout],
  );

  useEffect(() => {
    pause();
  }, [pathname, pause]);

  return (
    <div
      id="story-viewer"
      className="no-scrollbar m-4 mx-auto h-[80svh] max-w-5xl snap-y snap-mandatory overflow-y-scroll rounded-xl bg-white/50 p-2"
    >
      {texts.map((text, i) => (
        <section
          className="flex h-full snap-center flex-col items-center justify-center"
          key={i}
        >
          <div className="relative">
            <AudioButton audios={audios} play={play} i={i} />
            <ContentMedia data={medias[i]} />
          </div>
          <div className="relative flex items-center justify-center rounded-xl p-2 text-center text-2xl sm:px-10 sm:leading-[2em]">
            {text}
          </div>
        </section>
      ))}
    </div>
  );
}

const AudioButton = ({
  audios,
  play,
  i,
}: {
  audios: any;
  play: (index: number) => void;
  i: number;
}) => {
  if (!audios[1]) return null;
  return (
    audios[1] && (
      <div className="absolute right-2 top-2">
        <Button label="" onClick={() => play(i)} icon={GiSpeaker} small />
      </div>
    )
  );
};
