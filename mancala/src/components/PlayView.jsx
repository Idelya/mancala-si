import "./Modal.css"
import { GameScore } from "./GameScore"
import { Board } from "./Board"
export function PlayView() {
    return (
    <div className="">
        <GameScore/>
        <Board />
    </div>
    );
  }