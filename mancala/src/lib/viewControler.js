export function highlightHole(hole) {
    console.log(`hole-${hole.playerId}-${hole.id}`);
    document.getElementById(`hole-${hole.playerId}-${hole.id}`).classList.add("acive");
    /*setTimeout(() => {
        document.getElementById(`hole-${hole.playerId}-${hole.id}`).classList.remove("acive");
    }, 20000);*/
}