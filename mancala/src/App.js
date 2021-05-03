import './App.css';
import { api, useStore, useSubscribe } from './lib/store';
import { Modal } from "./components/Modal"
import { PlayView } from "./components/PlayView"

function App() {

  const gamestate = useStore(state => state.gamestate)
  return (
    <div className="App">
      {gamestate === "initial" && <Modal title="Mancala" content="click play to start" confirmText="Play" confirmFun={() => api.setState(() => ({
        gamestate: "play"
      }))}/>}
      {gamestate === "play" && <PlayView />}
    </div>
  );
}

export default App;
