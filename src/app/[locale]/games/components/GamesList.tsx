"use client";

import { useState } from "react";
import GameCard from "./GameCard";
import GameFrame from "./GameFrame";

export default function GamesList({ games }: { games: any[] }) {
  const [selectedGame, setSelectedGame] = useState<any>(null);

  if (selectedGame) {
    return (
      <GameFrame
        embedId={selectedGame.fields.embedId}
        itchGameId={selectedGame.fields.itchGameId}
      />
    );
  }
  return (
    <div className="flex flex-wrap justify-center gap-5 p-4 sm:p-10">
      {games.map((entry: any) => (
        <div key={entry.sys.id} onClick={() => setSelectedGame(entry)}>
          <GameCard
            title={entry.fields.title}
            imageUrl={entry.fields.cardImage}
            createdAt={entry.sys.createdAt}
          />
        </div>
      ))}
    </div>
  );
}
