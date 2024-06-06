"use client";

import { useState, useCallback, useMemo, useEffect } from "react";

import { GiSpeaker } from "react-icons/gi";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import Button from "@/components/Shared/Button";
import ContentPart from "./ContentPart";
import ContentMedia from "./ContentMedia";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { Reveal } from "../Shared/Reveal";

interface ContentViewerProps {
  medias: any[];
  texts: string[];
  audios: any;
}

export default function Summary({ medias, texts, audios }: ContentViewerProps) {
  const locale = useLocale();

  const pathname = usePathname();

  const [playTimeout, setPlayTimeout]: any = useState();

  let audio = useMemo(() => {
    if (audios[1]) {
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
    <ContentPart id="story-viewer">
      {texts.map((text, i) => (
        <div
          className=" flex min-h-screen items-center justify-center border-b"
          dir={locale == "ar" ? "rtl" : "ltr"}
        >
          <Reveal key={i}>
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <AudioButton audios={audios} play={play} i={i} />
                <ContentMedia data={medias[i]} />
              </div>
              <div className="relative flex items-center justify-center rounded-xl p-2 text-center text-2xl sm:px-10 sm:leading-[2em]">
                {text}
              </div>
            </div>
          </Reveal>
        </div>
      ))}
    </ContentPart>
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
