export default function GameFrame({ embedId, itchGameId }) {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <iframe
        src={"https://itch.io/embed-upload/" + embedId}
        allowFullScreen
        width="960"
        height="620"
        title="Other Game"
      >
        <a href={"https://medmor.itch.io/" + itchGameId}>
          Play on itch.io
        </a>
      </iframe>
    </div>
  );
}
