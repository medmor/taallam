import ContentPart from "./ContentPart";
import { useTranslations } from "next-intl";

interface ContentLessons {
  lessons: string[];
}
export default function ContentLessons({ lessons }: ContentLessons) {
  const t = useTranslations("contentLessons");
  return (
    <div className="mt-20">
      <div className="bg-white p-2 text-center text-xl font-bold">
        {t("lessons")}
      </div>
      <div className="p-4">
        {lessons.map((lesson) => {
          const parts = lesson.split(":");
          return (
            <div
              key={parts[0]}
              className="my-2 rounded-lg bg-white p-2 text-center text-lg"
            >
              <span className="font-bold">{parts[0]} </span> {parts[1]}
            </div>
          );
        })}
      </div>
    </div>
  );
}
