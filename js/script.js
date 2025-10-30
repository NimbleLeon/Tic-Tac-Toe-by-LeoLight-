class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.aiMode = false;
        this.difficulty = 'medium';
        this.darkMode = false;
        this.scores = {
            X: 0,
            O: 0,
            draw: 0
        };
        
        this.winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Горизонтальные
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Вертикальные
            [0, 4, 8], [2, 4, 6] // Диагональные
        ];
        
        this.initializeGame();
        this.loadSettings();
    }
    
    initializeGame() {
        this.cells = document.querySelectorAll('.cell');
        this.gameStatus = document.getElementById('gameStatus');
        this.restartBtn = document.getElementById('restartBtn');
        this.resetScoreBtn = document.getElementById('resetScoreBtn');
        this.modal = document.getElementById('resultModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalMessage = document.getElementById('modalMessage');
        this.modalBtn = document.getElementById('modalBtn');
        
        // Новые элементы
        this.darkModeToggle = document.getElementById('darkModeToggle');
        this.aiModeToggle = document.getElementById('aiModeToggle');
        this.difficultySelect = document.getElementById('difficultySelect');
        this.difficultySelector = document.getElementById('difficultySelector');
        this.opponentLabel = document.getElementById('opponentLabel');
        
        this.scoreX = document.getElementById('scoreX');
        this.scoreO = document.getElementById('scoreO');
        this.scoreDraw = document.getElementById('scoreDraw');
        
        this.addEventListeners();
        this.updateGameStatus();
        this.updateScores();
        this.updateOpponentLabel();
    }
    
    addEventListeners() {
        this.cells.forEach(cell => {
            cell.addEventListener('click', () => this.handleCellClick(cell));
        });
        
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.resetScoreBtn.addEventListener('click', () => this.resetScores());
        this.modalBtn.addEventListener('click', () => this.closeModal());
        
        // Новые слушатели
        this.darkModeToggle.addEventListener('change', () => this.toggleDarkMode());
        this.aiModeToggle.addEventListener('change', () => this.toggleAiMode());
        this.difficultySelect.addEventListener('change', () => this.changeDifficulty());
    }
    
    loadSettings() {
        // Загружаем настройки из Local Storage
        const savedDarkMode = localStorage.getItem('ticTacToeDarkMode') === 'true';
        const savedAiMode = localStorage.getItem('ticTacToeAiMode') === 'true';
        const savedDifficulty = localStorage.getItem('ticTacToeDifficulty') || 'medium';
        
        this.darkMode = savedDarkMode;
        this.aiMode = savedAiMode;
        this.difficulty = savedDifficulty;
        
        this.darkModeToggle.checked = this.darkMode;
        this.aiModeToggle.checked = this.aiMode;
        this.difficultySelect.value = this.difficulty;
        
        this.applyDarkMode();
        this.updateDifficultyVisibility();
    }
    
    saveSettings() {
        localStorage.setItem('ticTacToeDarkMode', this.darkMode);
        localStorage.setItem('ticTacToeAiMode', this.aiMode);
        localStorage.setItem('ticTacToeDifficulty', this.difficulty);
    }
    
    toggleDarkMode() {
        this.darkMode = this.darkModeToggle.checked;
        this.applyDarkMode();
        this.saveSettings();
    }
    
    applyDarkMode() {
        if (this.darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }
    
    toggleAiMode() {
        this.aiMode = this.aiModeToggle.checked;
        this.updateOpponentLabel();
        this.updateDifficultyVisibility();
        this.saveSettings();
        
        // Если включен ИИ и сейчас его ход
        if (this.aiMode && this.currentPlayer === 'O' && this.gameActive) {
            setTimeout(() => this.makeAiMove(), 500);
        }
    }
    
    updateOpponentLabel() {
        this.opponentLabel.textContent = this.aiMode ? 'Компьютер (O)' : 'Игрок (O)';
    }
    
    updateDifficultyVisibility() {
        this.difficultySelector.style.display = this.aiMode ? 'flex' : 'none';
    }
    
    changeDifficulty() {
        this.difficulty = this.difficultySelect.value;
        this.saveSettings();
    }
    
    handleCellClick(cell) {
        if (!this.gameActive) return;
        
        const index = parseInt(cell.dataset.index);
        
        if (this.board[index] !== '') {
            return;
        }
        
        // Если игра с ИИ и ходит игрок
        if (this.aiMode && this.currentPlayer === 'X') {
            this.makeMove(index, cell);
            
            // Ход ИИ после небольшой задержки
            if (this.gameActive && this.currentPlayer === 'O') {
                setTimeout(() => this.makeAiMove(), 500);
            }
        } 
        // Если игра двух игроков
        else if (!this.aiMode) {
            this.makeMove(index, cell);
        }
    }
    
    makeMove(index, cell) {
        this.board[index] = this.currentPlayer;
        cell.classList.add(this.currentPlayer.toLowerCase());
        cell.textContent = this.currentPlayer;
        
        if (this.checkWinner()) {
            this.handleGameEnd('win');
            return;
        }
        
        if (this.checkDraw()) {
            this.handleGameEnd('draw');
            return;
        }
        
        this.switchPlayer();
        this.updateGameStatus();
    }
    
    makeAiMove() {
        if (!this.gameActive || this.currentPlayer !== 'O') return;
        
        let move;
        
        switch (this.difficulty) {
            case 'easy':
                move = this.getRandomMove();
                break;
            case 'medium':
                move = this.getMediumMove();
                break;
            case 'hard':
                move = this.getBestMove();
                break;
        }
        
        if (move !== -1) {
            const cell = this.cells[move];
            this.makeMove(move, cell);
        }
    }
    
    getRandomMove() {
        const emptyCells = this.board
            .map((cell, index) => cell === '' ? index : -1)
            .filter(index => index !== -1);
        
        return emptyCells.length > 0 ? 
            emptyCells[Math.floor(Math.random() * emptyCells.length)] : -1;
    }
    
    getMediumMove() {
        // Сначала проверяем выигрышный ход
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                if (this.checkWinner()) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Затем блокируем выигрыш игрока
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'X';
                if (this.checkWinner()) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Если центр свободен - занимаем его
        if (this.board[4] === '') return 4;
        
        // Иначе случайный ход
        return this.getRandomMove();
    }
    
    getBestMove() {
        // Минимакс алгоритм для сложного ИИ
        let bestScore = -Infinity;
        let bestMove = -1;
        
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                let score = this.minimax(this.board, 0, false);
                this.board[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove !== -1 ? bestMove : this.getRandomMove();
    }
    
    minimax(board, depth, isMaximizing) {
        // Проверяем терминальные состояния
        if (this.checkWinnerForMinimax(board, 'O')) return 10 - depth;
        if (this.checkWinnerForMinimax(board, 'X')) return depth - 10;
        if (this.checkDrawForMinimax(board)) return 0;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = this.minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = this.minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }
    
    checkWinnerForMinimax(board, player) {
        return this.winningConditions.some(condition => {
            const [a, b, c] = condition;
            return board[a] === player && board[a] === board[b] && board[a] === board[c];
        });
    }
    
    checkDrawForMinimax(board) {
        return board.every(cell => cell !== '');
    }
    
    checkWinner() {
        return this.winningConditions.some(condition => {
            const [a, b, c] = condition;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                // Подсвечиваем выигрышную комбинацию
                condition.forEach(index => {
                    this.cells[index].classList.add('winner');
                });
                return true;
            }
            return false;
        });
    }
    
    checkDraw() {
        return this.board.every(cell => cell !== '');
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }
    
    updateGameStatus() {
        const playerElement = this.currentPlayer === 'X' ? 
            '<span class="player-x">X</span>' : 
            '<span class="player-o">O</span>';
        
        const playerName = this.currentPlayer === 'X' ? 'Игрок' : 
            (this.aiMode ? 'Компьютер' : 'Игрок');
            
        this.gameStatus.innerHTML = `Ход: ${playerName} ${playerElement}`;
    }
    
    handleGameEnd(result) {
        this.gameActive = false;
        
        switch (result) {
            case 'win':
                this.scores[this.currentPlayer]++;
                const winnerName = this.currentPlayer === 'X' ? 'Игрок (X)' : 
                    (this.aiMode ? 'Компьютер (O)' : 'Игрок (O)');
                    
                this.showModal(
                    'Победа! 🎉',
                    `${winnerName} выиграл эту партию!`
                );
                break;
            case 'draw':
                this.scores.draw++;
                this.showModal('Ничья! ', 'Отличная игра! Попробуйте ещё раз.');
                break;
        }
        
        this.updateScores();
    }
    
    showModal(title, message) {
        this.modalTitle.innerHTML = title;
        this.modalMessage.innerHTML = message;
        this.modal.style.display = 'flex';
    }
    
    closeModal() {
        this.modal.style.display = 'none';
        this.restartGame();
    }
    
    restartGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        this.updateGameStatus();
        
        // Если игра с ИИ и компьютер ходит первым
        if (this.aiMode && this.currentPlayer === 'O') {
            setTimeout(() => this.makeAiMove(), 500);
        }
    }
    
    resetScores() {
        this.scores = { X: 0, O: 0, draw: 0 };
        this.updateScores();
        this.restartGame();
    }
    
    updateScores() {
        this.scoreX.textContent = this.scores.X;
        this.scoreO.textContent = this.scores.O;
        this.scoreDraw.textContent = this.scores.draw;
    }
}

// Запуск игры когда страница загружена
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});

// Добавляем анимацию при загрузке
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.container').style.opacity = '0';
    document.querySelector('.container').style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        document.querySelector('.container').style.transition = 'all 0.5s ease';
        document.querySelector('.container').style.opacity = '1';
        document.querySelector('.container').style.transform = 'translateY(0)';
    }, 100);
});