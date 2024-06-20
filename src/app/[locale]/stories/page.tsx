import { getTranslations } from "next-intl/server";
import { getEntries } from "@/lib/contentful/client";
import PreviewContent from "@/components/Shared/PreviewContent";
import HomeCardList from "@/components/Shared/HomeCardList";

export async function generateMetadata() {
  const t = await getTranslations("home");
  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

interface StoriesPageProps {
  params: {
    locale: string;
  };
}
export default async function StoriesPage({ params }: StoriesPageProps) {
  const uslocale = params.locale == "en" || params.locale == "fr" ? "en-US" : params.locale;
  const entries = await getEntries("course", uslocale, "story");

  return (
    <>
      <HomeCardList entries={entries} hrefBase={`/${params.locale}/stories`} />
      {process.env.NODE_ENV === "development" && (
        <PreviewContent href={`/${params.locale}/stories/`} locale={uslocale} />
      )}
    </>
  );
}
