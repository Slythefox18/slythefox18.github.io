const board = document.getElementById('board');
            const restartButton = document.getElementById('restartButton');
            const status = document.getElementById('status');
            const modal = document.getElementById('modal');
            const modalMessage = document.getElementById('modalMessage');
            const modalCloseButton = document.getElementById('modalCloseButton');
        
            let currentPlayer = 'X';
            let gameState = ['', '', '', '', '', '', '', '', ''];
            let gameActive = true;
        
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
        
            function handleCellClick(clickedCellEvent) {
              const clickedCell = clickedCellEvent.target;
              const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));
        
              if (gameState[clickedCellIndex] !== '' || !gameActive) {
                return;
              }
        
              gameState[clickedCellIndex] = currentPlayer;
              clickedCell.innerHTML = currentPlayer === 'X' ? '<i class="fas fa-times"></i>' : '<i class="far fa-circle"></i>';
        
              if (checkWin()) {
                setTimeout(() => {
                  showModal(`Player ${currentPlayer} has won!`);
                  launchConfetti();
                }, 100);
                gameActive = false;
                return;
              }
        
              if (!gameState.includes('')) {
                setTimeout(() => {
                  showModal("It's a draw!");
                  launchConfetti();
                }, 100);
                gameActive = false;
                return;
              }
        
              currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
              status.innerHTML = `Player ${currentPlayer}'s turn`;
            }
        
            function checkWin() {
              return winningConditions.some((condition) => {
                return condition.every((index) => {
                  return gameState[index] === currentPlayer;
                });
              });
            }
        
            function restartGame() {
              currentPlayer = 'X';
              gameState = ['', '', '', '', '', '', '', '', ''];
              gameActive = true;
              status.innerHTML = `Player ${currentPlayer}'s turn`;
              document.querySelectorAll('.cell').forEach((cell) => (cell.innerHTML = ''));
              hideModal();
            }
        
            function showModal(message) {
              modalMessage.innerHTML = message;
              modal.classList.remove('invisible');
            }
        
            function hideModal() {
              modal.classList.add('invisible');
            }
        
            function launchConfetti() {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
              });
            }
        
            board.addEventListener('click', handleCellClick);
            restartButton.addEventListener('click', restartGame);
            modalCloseButton.addEventListener('click', hideModal, restartGame);