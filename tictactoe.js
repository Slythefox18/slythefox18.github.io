const cells = document.querySelectorAll('.cell')
const statusText = document.querySelector('statusText')
const restart = document.querySelector('#restartGame')
const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

let options = ["", "", "", "", "", "", "", "", ""]
let currentPlayer = "X";
let running = false;

startGame

function startGame() {
	cells.forEach(cell => cell.addEventListener("click", cellClicked))
	restart.addEventListener("click", restart)
	statusText.textContent = `${currentPlayer}'s Turn`
	running = true
}

function cellClicked() {
	const cellIndex = this.getAttribute(cell, index)

	if(options[cellIndex] != "" || !running) {
		return
	}
	
	updateCell(this, cellIndex);
	checkWinner();
}

function updateCell(cell, index) {
	options[index] = currentPlayer;
	cell.textContent = currentPlayer;
}

function changePlayer() {
	
}

function checkWinner() {
	
}

function restartGame() {
	
}