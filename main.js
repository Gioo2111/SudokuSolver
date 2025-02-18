document.addEventListener('DOMContentLoaded', function (){
    const gridSize = 9;
    const solve = document.getElementById("solve");
    solve.addEventListener('click', solveSudoku);
    const clear = document.getElementById("clear");
    clear.addEventListener('click', clearSudoku);

    const sudokuGrid = document.getElementById("grid");
    
    for(let row = 0; row < gridSize; row++){
        const newRow = document.createElement("tr");
        for(let col = 0; col < gridSize; col++){
            const cell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.max = 9;
            input.min = 1;
            input.className = "cell";
            input.id = `cell-${row}-${col}`;
            input.addEventListener('input', function () {
                if (parseInt(input.value) > 9) {
                    input.value = 9;
                }
                if (parseInt(input.value) < 1) {
                    input.value = 1;
                }
                if (input.value === "") {
                    input.classList.remove("solved", "invalid");
                }
            });
            cell.appendChild(input);
            newRow.appendChild(cell);
        }
        sudokuGrid.appendChild(newRow);
    }
    document.addEventListener('keydown', function (event) {
        const activeElement = document.activeElement;
        
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
        }
        if (activeElement && activeElement.tagName === 'INPUT' && activeElement.type === 'number') {
            const idParts = activeElement.id.split('-');
            const row = parseInt(idParts[1]);
            const col = parseInt(idParts[2]);

            if (event.key === "ArrowDown" && row < 8) { 
                document.getElementById(`cell-${row + 1}-${col}`).focus();
            } else if (event.key === "ArrowUp" && row > 0) { 
                document.getElementById(`cell-${row - 1}-${col}`).focus();
            } else if (event.key === "ArrowRight" && col < 8) { 
                document.getElementById(`cell-${row}-${col + 1}`).focus();
            } else if (event.key === "ArrowLeft" && col > 0) { 
                document.getElementById(`cell-${row}-${col - 1}`).focus();
            }
        }
    });
});
let clickAudio = new Audio("/Click.wav");
let isSolving = false;
async function clearSudoku() {
    const gridSize = 9;
    const sudokuGrid = document.getElementById("grid");
    isSolving = false; 

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cellId = `cell-${row}-${col}`;
            const cell = document.getElementById(cellId);
            cell.value = ""; 
            cell.classList.remove("userInput", "solved", "invalid");
        }
    }
    clickAudio.play();
}

async function solveSudoku(){
    const gridSize = 9;
    const sudokuArray = [];

    for(let row = 0; row < gridSize; row++){
        sudokuArray[row] = [];
        for(let col = 0; col < gridSize; col++){
            const cellId = `cell-${row}-${col}`;
            const cellValue = document.getElementById(cellId).value;
            sudokuArray[row][col] = cellValue !== "" ? parseInt(cellValue) : 0;
        }
    }
    const { isInvalid, invalidCells } = isInvalidBoard(sudokuArray);

    if (isInvalid) {
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const cellId = `cell-${row}-${col}`;
                const cell = document.getElementById(cellId);
                cell.classList.remove("invalid");
            }
        }

        invalidCells.forEach(({ row, col }) => {
            const cellId = `cell-${row}-${col}`;
            const cell = document.getElementById(cellId);
            cell.classList.add("invalid");
        });

        alert("Invalid game. Numbers cannot appear more than once in the same row, column nor square.");
        return;
    }
    isSolving = true;
    attempts = 0;

    for(let row = 0; row < gridSize; row++){
        for(let col = 0; col < gridSize; col++){
            const cellId = `cell-${row}-${col}`;
            const cell = document.getElementById(cellId);

            if(sudokuArray[row][col] !== 0){
                cell.classList.add("userInput");
            }
        }
    }
    const solved = await solveSudokuHelper(sudokuArray);

    if(solved){
        for(let row = 0; row < gridSize; row++){
            for(let col = 0; col < gridSize; col++){
                const cellId = `cell-${row}-${col}`;
                const cell = document.getElementById(cellId);

                if(!cell.classList.contains("userInput")){
                    cell.value = sudokuArray[row][col];
                    cell.classList.add("solved");
                    await sleep(30);
                    if (!isSolving) return;
                }
            }
        }
    }
    else {
        alert("There's no solution for this Sudoku.");
    }
    isSolving = false;
}

let maxAttempts = 100000;
let attempts = 0;
async function solveSudokuHelper(board) {
    const gridSize = 9;

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (board[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValidMove(board, row, col, num)) {
                        board[row][col] = num;
                        attempts++;

                        if (attempts > maxAttempts) {
                            return false;
                        }

                        if (await solveSudokuHelper(board)) {
                            return true;
                        }
                        board[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    clickAudio.play();
    return true;
}

function isValidMove(board, row, col, num) {
    const gridSize = 9;

    for (let i = 0; i < gridSize; i++) {
        if (board[row][i] === num || board[i][col] === num) {
            return false; 
        }
    }

    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;

    for (let i = startRow; i < startRow + 3; i++) {
        for (let j = startCol; j < startCol + 3; j++) {
            if (board[i][j] === num) {
                return false;
            }
        }
    }

    return true; 
}

function isInvalidBoard(board) {
    const gridSize = 9;
    const invalidCells = []
    for (let row = 0; row < gridSize; row++) {
        const seenRow = new Set();
        for (let col = 0; col < gridSize; col++) {
            if (board[row][col] !== 0) {
                if (seenRow.has(board[row][col])) {
                    for (let i = 0; i < gridSize; i++) {
                        if (board[row][i] === board[row][col]) {
                            invalidCells.push({ row, col: i });
                        }
                    }
                    return { isInvalid: true, invalidCells };
                }
                seenRow.add(board[row][col]);
            }
        }
    }

    for (let col = 0; col < gridSize; col++) {
        const seenCol = new Set();
        for (let row = 0; row < gridSize; row++) {
            if (board[row][col] !== 0) {
                if (seenCol.has(board[row][col])) {
                    for (let i = 0; i < gridSize; i++) {
                        if (board[i][col] === board[row][col]) {
                            invalidCells.push({ row: i, col });
                        }
                    }
                    return { isInvalid: true, invalidCells };
                }
                seenCol.add(board[row][col]);
            }
        }
    }

    for (let startRow = 0; startRow < gridSize; startRow += 3) {
        for (let startCol = 0; startCol < gridSize; startCol += 3) {
            const seenBox = new Set();
            for (let row = startRow; row < startRow + 3; row++) {
                for (let col = startCol; col < startCol + 3; col++) {
                    if (board[row][col] !== 0) {
                        if (seenBox.has(board[row][col])) {
                            for (let i = startRow; i < startRow + 3; i++) {
                                for (let j = startCol; j < startCol + 3; j++) {
                                    if (board[i][j] === board[row][col]) {
                                        invalidCells.push({ row: i, col: j });
                                    }
                                }
                            }
                            return { isInvalid: true, invalidCells };
                        }
                        seenBox.add(board[row][col]);
                    }
                }
            }
        }
    }

    return { isInvalid: false, invalidCells: [] };
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}