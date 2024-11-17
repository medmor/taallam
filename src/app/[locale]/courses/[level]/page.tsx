import { getTranslations } from "next-intl/server";
import PreviewContent from "@/components/Shared/PreviewContent";
import { getEntries } from "@/lib/contentful/client";
import HomeCardList from "@/components/Shared/HomeCardList";

export async function generateMetadata() {
  const t = await getTranslations("home");
  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

interface CoursesPageProps {
  params: Promise<{
    level: string;
    locale: string;
  }>;
}
export default async function CoursesPage({ params }: CoursesPageProps) {
  const {level, locale} = await params
  const uslocale =
    locale == "en" || locale == "fr" ? "en-US" : locale;
  const entries = await getEntries("course", uslocale, level);

  return (
    <>
      <HomeCardList
        entries={entries}
        hrefBase={`/${locale}/courses/${level}`}
      />
      {process.env.NODE_ENV === "development" && (
        <PreviewContent
          href={`/${locale}/courses/${level}/`}
          locale={uslocale}
        />
      )}
    </>
  );
}
