import SpaceScene from "./components/SpaceScene";

export default function App() {
  return (
    <div className="app">
      <SpaceScene />
      <footer className="footer">
        <span>
          Tip: Click stars, or use Mission Control list. Press <b>Space</b> to
          start/stop “Story Mode”.
        </span>
      </footer>
    </div>
  );
}
