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

export default async function StoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const uslocale =
    locale == "en" || locale == "fr" ? "en-US" : locale;
  const entries = await getEntries("course", uslocale, "story");

  return (
    <>
      <HomeCardList entries={entries} hrefBase={`/${locale}/stories`} />
      {process.env.NODE_ENV === "development" && (
        <PreviewContent href={`/${locale}/stories/`} locale={uslocale} />
      )}
    </>
  );
}
