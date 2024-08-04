"use client";

import { useState } from "react";
import GameCard from "./GameCard";
import GameFrame from "./GameFrame";
import { IoCloseCircle } from "react-icons/io5";

export default function GamesList({ games }: { games: any[] }) {
  const [selectedGame, setSelectedGame] = useState<any>(null);

  return (
    <>
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
      {selectedGame && (
        <div className="fixed bottom-0 left-0 right-0 top-0 z-10 bg-black/50">
          <button
            className="absolute right-4 top-4 text-4xl text-white"
            onClick={() => setSelectedGame(null)}
          >
            <IoCloseCircle />
          </button>
          <GameFrame
            embedId={selectedGame.fields.embedId}
            itchGameId={selectedGame.fields.itchGameId}
          />
        </div>
      )}
    </>
  );
}
