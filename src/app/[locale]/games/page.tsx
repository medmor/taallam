import { getGames } from "@/lib/contentful/client";
import GameCard from "./components/GameCard";
import GamesList from "./components/GamesList";

export default async function GamesPage({
  params,
}: {
  params: { locale: string };
}) {
  const uslocale =
    params.locale == "en" || params.locale == "fr" ? "en-US" : params.locale;
  const entries = await getGames(uslocale);

  return <GamesList games={entries} />;
}
