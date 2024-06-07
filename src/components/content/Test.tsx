"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import Mcq from "@/components/quiz/Mcq";
import ContentPart from "./ContentPart";

import { Quiz } from "@/types/QuizType";

interface ContentTestProps {
  quizzes: Quiz[];
}
export default function ContentTest({ quizzes }: ContentTestProps) {
  const t = useTranslations("contentTest");
  const [score, setScore] = useState(0);
  return (
    <div className="no-scrollbar relative m-4 max-h-[90svh] snap-y snap-mandatory overflow-y-scroll rounded-xl bg-white p-2">
      <div className="font-start sticky top-0 flex justify-start">
        <div className="rounded-full border bg-white p-4 text-center font-bold">
          {t("score")} <br />
          <span dir="ltr">
            {score} / {quizzes.length}
          </span>
        </div>
      </div>
      {/* <div className="mb-2 bg-white p-1 text-center font-bold">
        <div className="border-b border-b-orange-400 py-2">{t("quiz")}</div>
      </div> */}
      {quizzes.map((quiz) => {
        return (
          <div
            key={quiz.question}
            dir="ltr"
            className="flex h-full w-full snap-center flex-col items-center justify-center text-center"
          >
            <Mcq quiz={quiz} setScore={setScore} />
          </div>
        );
      })}
    </div>
  );
}
