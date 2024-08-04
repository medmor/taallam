export default function GameFrame({
  embedId,
  itchGameId,
}: {
  embedId: string;
  itchGameId: string;
}) {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <iframe
        src={"https://itch.io/embed-upload/" + embedId}
        allowFullScreen
        width="960"
        height="620"
      >
        <a href={"https://medmor.itch.io/" + itchGameId}>
          Play Maze Learn on itch.io
        </a>
      </iframe>
    </div>
  );
}
