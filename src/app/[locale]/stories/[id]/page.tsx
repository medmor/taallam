import { getTranslations } from "next-intl/server";

import { getEntryById } from "@/lib/contentful/client";
import { parseQuizzes, parseSummary } from "@/lib/contentful/helpers";
import CourseContent from "@/components/content/CourseContent";

export async function generateMetadata() {
  const t = await getTranslations("home");
  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

interface StoryPageProps {
  params: {
    id: string;
    locale: string;
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const story = await getEntryById(
    params.id,
    params.locale == "en" || params.locale == "fr" ? "en-US" : params.locale,
  );

  const medias: any = [];
  const texts: any[] = [];
  const audios: any[] = [`/audios/${story.sys.id}/${params.locale}/audio.mp3`];
  await parseSummary(story.fields.summary, texts, medias, audios);
  const quizzes = parseQuizzes(story.fields.activities);

  return (
    <>
      <CourseContent
        texts={texts.filter((t) => t)}
        medias={medias}
        audios={audios}
        quizzes={quizzes}
        lessons={story.fields.objectifs}
      />
    </>
  );
}
