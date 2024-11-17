import { getGames } from "@/lib/contentful/client";
import GamesList from "./components/GamesList";

export default async function GamesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const uslocale =
    locale == "en" || locale == "fr" ? "en-US" : locale;
  const entries = await getGames(uslocale);

  return <GamesList games={entries} />;
}
