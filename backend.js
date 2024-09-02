const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

server.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

let lastUpdateTime = Date.now();
const FPS = 130; 

function sendGameUpdates() {
    const currentTime = Date.now();
    const deltaTime = currentTime - lastUpdateTime;
    const timePerFrame = 1000 / FPS;

    if (deltaTime > timePerFrame) {
        lastUpdateTime = currentTime;
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    backendGameGrid,
                    backendPlayers,
                    currentPlayer,
                    playerCount,
                    seconds,
                    readySeconds,
                    chatMessages,
                }));
            }
        });
    }
    setTimeout(sendGameUpdates, 0);
}
sendGameUpdates();

let gameStarted = false;
let countdown;
let seconds; 
let playerCount = 0;
function startCountdown() {
    seconds = 20; //CHANGE TO 20
    countdown = setInterval(() => {
        seconds--;

        if (seconds === 0) {
            clearInterval(countdown);
            startReadyTimer();
        }         
        if (playerCount < 2) {
            clearInterval(countdown); 
        }
        if (playerCount === 4) {
            seconds = 0;
            clearInterval(countdown);
            startReadyTimer();
        }
    }, 1000);
}

let readySeconds;
function startReadyTimer() {
    gameStarted = true;
    readySeconds = 10; //CHANGE TO 10
    countdown = setInterval(() => {
        readySeconds--;

        if (readySeconds === 0) {
            clearInterval(countdown);
        }
        if (playerCount < 2) {
            clearInterval(countdown); 
        }
    }, 1000);
}

const numRows = 13;
const numCols = 15;
const softWalls = generateSoftWalls(numRows, numCols);
function generateSoftWalls(numRows, numCols) {
    const softWalls = new Array(numRows).fill(null).map(() => new Array(numCols).fill(false));

    for (let i = 1; i < numRows - 1; i++) {
        for (let j = 1; j < numCols - 1; j++) {
            if (Math.random() < 0.7) {
                softWalls[i][j] = true;
            }
        }
    }
    return softWalls;
}

let backendGameGrid = createBackendGameGrid(numRows, numCols);
function createBackendGameGrid(numRows, numCols) {
    const grid = [];

    for (let i = 0; i < numRows; i++) {
        const row = [];
        for (let j = 0; j < numCols; j++) {
            if (i === 0 || i === numRows - 1 || j === 0 || j === numCols - 1 || (i % 2 === 0 && j % 2 === 0)) {
                row.push('1'); 
            } else if (softWalls[i][j]) {
                row.push('soft-wall'); 
            } else {
                row.push('0');
            }
        }
        grid.push(row);
    }

    // Add 'x' marks where not to place soft-walls
    grid[1][1] = 'x';
    grid[1][13] = 'x';
    grid[11][1] = 'x';
    grid[11][13] = 'x';
    grid[1][2] = 'x';
    grid[1][12] = 'x';
    grid[11][2] = 'x';
    grid[11][12] = 'x';
    grid[2][1] = 'x';
    grid[10][1] = 'x';
    grid[2][13] = 'x';
    grid[10][13] = 'x';

    return grid;
}

const availablePlayerLabels = ['p1', 'p2', 'p3', 'p4'];
const initialPlayerPositions = {
    'p1': { x: 1, y: 1 },
    'p2': { x: 13, y: 1 },
    'p3': { x: 1, y: 11 },
    'p4': { x: 13, y: 11 },
}
let nextPlayerId = 1;
const playerLives = 3;
let currentPlayer;
const backendPlayers = {};
let chatMessages = {};
const playerConnections = new Map();
let bombActiveMap = new Map();
let flamesActiveMap = new Map();
let bombsActiveMap = new Map();
let speedActiveMap = new Map();

wss.on('connection', (ws) => {
    const playerId = nextPlayerId++;
    console.log(`Player ${playerId} connected.`);

    const playerLabel = availablePlayerLabels.shift();

    if (!playerLabel) {
        ws.send(JSON.stringify({ type: 'max_players_reached' }));
        return; 
    }

    if (gameStarted) {
        ws.send(JSON.stringify({ type: 'game_already_started' }));
        return; 
    }

    let initialPosition = initialPlayerPositions[playerLabel];

    backendPlayers[playerId] = {
        x: initialPosition.x,
        y: initialPosition.y,
        id: playerId,
        playerLives,
        playerName: '',
        direction:'',
        gameover: '',
        winner: '',
    };

    const lastProcessedTimes = {};

    ws.on('message', (message) => {
        currentPlayer = backendPlayers[playerId];
        let parsedMessage;
        try {
            parsedMessage = JSON.parse(message);
        } catch (error) {
            console.error('Error parsing message:', error);
            return;
        }
    
        if (!currentPlayer) {
            console.log(`Player ${playerId} not found`);
            return;
        }
    
        let newX = currentPlayer.x;
        let newY = currentPlayer.y;
    
        if (parsedMessage.type === 'chat') {
            const messageId = parsedMessage.id;
            chatMessages[messageId] = parsedMessage;
            return; 
        }

        if (!lastProcessedTimes[playerId]) {
            lastProcessedTimes[playerId] = 0;
        }

        let delayBetweenKeydowns;
        if (speedActiveMap.get(currentPlayer.id)) {
            delayBetweenKeydowns = 0;
        } else {
            delayBetweenKeydowns = 300;
        }

        const currentTime = Date.now();
        let bombCount = 0; 
        if (currentTime - lastProcessedTimes[playerId] > delayBetweenKeydowns) {
            lastProcessedTimes[playerId] = currentTime;
            if (parsedMessage.type === 'user') {
                switch (parsedMessage.message) {
                    case 'ArrowUp':
                        newY -= 1;
                        currentPlayer.direction = 'up';
                        break;
                    case 'ArrowDown':
                        newY += 1;
                        currentPlayer.direction = 'down';
                        break;
                    case 'ArrowLeft':
                        newX -= 1;
                        currentPlayer.direction = 'left';
                        break;
                    case 'ArrowRight':
                        newX += 1;
                        currentPlayer.direction = 'right';
                        break;
                    case ' ':
                        if (!bombActiveMap.get(currentPlayer.id) && !flamesActiveMap.get(currentPlayer.id) && !bombsActiveMap.get(currentPlayer.id)) {
                            const playerId = currentPlayer.id;
                            backendGameGrid[newY][newX] = 'bomb';
                            bombActiveMap.set(playerId, true);
                            setTimeout(() => {
                                const explosionRange = 1; 
                                destroySoftWalls(explosionRange, newY, newX);
                                backendGameGrid[newY][newX] = '0';
                                bombActiveMap.set(playerId, false);
                            }, 4000);
                        } else if (!bombActiveMap.get(currentPlayer.id) && flamesActiveMap.get(currentPlayer.id)) {
                            backendGameGrid[newY][newX] = 'bomb2';
                            bombActiveMap.set(playerId, true);
                            setTimeout(() => {
                                const explosionRange = 2;
                                destroySoftWalls(explosionRange, newY, newX);
                                backendGameGrid[newY][newX] = '0';
                                flamesActiveMap.set(playerId, false)
                                bombActiveMap.set(playerId, false);
                            }, 4000);
                        } else if (bombsActiveMap.get(currentPlayer.id)) {
                            if (bombCount < 2) { 
                                backendGameGrid[newY][newX] = 'bomb';
                                bombCount++; 
                                setTimeout(() => {
                                    const explosionRange = 1; 
                                    destroySoftWalls(explosionRange, newY, newX);
                                    backendGameGrid[newY][newX] = '0';
                                    bombActiveMap.set(playerId, false);
                                    bombCount--; 
                                }, 4000);
                            }
                            bombsActiveMap.set(playerId, false)
                        }
                        break;
                    default:
                    currentPlayer.playerName = parsedMessage.playerName 
                    if (currentPlayer.playerName.length > 6) {
                        return;
                    } else if (currentPlayer.playerName !== '') {
                        playerCount++;
                        playerConnections.set(currentPlayer.playerName , ws); 
                    }
                    
                    if (playerCount === 2) {
                        startCountdown();
                    }
                    break;
                }
            }
        
            const targetCell = backendGameGrid[newY][newX];
        
            if (targetCell === '1' || targetCell === 'soft-wall' || targetCell === 'bomb') {
                return;
            }

            if (targetCell === 'bombs') {
                backendGameGrid[newY][newX] = '0';
                bombsActiveMap.set(currentPlayer.id, true);
            } else if (targetCell === 'flames') {
                backendGameGrid[newY][newX] = '0';
                flamesActiveMap.set(currentPlayer.id, true);
            } else if (targetCell === 'speed') {
                backendGameGrid[newY][newX] = '0';
                speedActiveMap.set(currentPlayer.id, true);
                setTimeout(() => {
                    speedActiveMap.set(currentPlayer.id, false);
                }, 10000);
            }
        
            currentPlayer.x = newX;
            currentPlayer.y = newY;
        }
        if (parsedMessage.type === 'user') {
            if (parsedMessage.message === 'keyUp') {
                currentPlayer.direction = 'keyUp';
            }
        }
    });
    
    ws.on('close', () => {
        console.log(`Player ${playerId} disconnected.`);
        playerConnections.delete(playerId); 
        delete backendPlayers[playerId];
        availablePlayerLabels.push(playerLabel);
        playerCount--;
        checkForWinner()
        if (playerCount === 0) {
            gameStarted = false;
            nextPlayerId = 1;
            chatMessages = {};
        }
    });
});

function destroySoftWalls(explosionRange, newY, newX) {
    const cellsToDestroy = [];

    const directions = [
        { rowChange: 0, colChange: 0 },
        { rowChange: 0, colChange: 1 }, 
        { rowChange: 0, colChange: -1 }, 
        { rowChange: 1, colChange: 0 }, 
        { rowChange: -1, colChange: 0 }, 
    ];

    for (const direction of directions) {
        for (let i = 1; i <= explosionRange; i++) {
            const row = newY + direction.rowChange * i;
            const col = newX + direction.colChange * i;

            if (backendGameGrid[row][col] !== '1') {
                cellsToDestroy.push({ row, col });
            } else {
                break;
            }
        }
    }

    for (const cell of cellsToDestroy) {
        if (backendGameGrid[cell.row][cell.col] !== '0' && backendGameGrid[cell.row][cell.col] !== 'bomb') {
            const powerUpChance = Math.random();
            if (powerUpChance <= 0.3) {
                const powerUpTypes = ['bombs', 'flames', 'speed'];
                const randomPowerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
                backendGameGrid[cell.row][cell.col] = randomPowerUp;
            } else {
                backendGameGrid[cell.row][cell.col] = '0';
            }
        }

        for (const playerId in backendPlayers) {
            const player = backendPlayers[playerId];
            if (player && cell.row === player.y && cell.col === player.x) {
                player.playerLives--;
                if (player.playerLives === 0) {
                    gameOver(playerId);
                    checkForWinner();
                }
            }
        }
    }
}

function gameOver(playerId) {
    backendPlayers[playerId].gameover = true;
    console.log(`For player ${playerId} game over.`);
}

function checkForWinner() {
    const remainingPlayers = Object.values(backendPlayers).filter(player => player.playerLives > 0);
    const isSinglePlayer = Object.keys(backendPlayers).length === 1;

    if (remainingPlayers.length === 1) {
        const winnerId = remainingPlayers[0].id;
        backendPlayers[winnerId].winner = true;
        console.log(`Player ${winnerId} is the winner.`);
    } else if (isSinglePlayer) {
        const singlePlayerId = Object.keys(backendPlayers)[0];
        backendPlayers[singlePlayerId].winner = true;
        console.log(`Player ${isSinglePlayer} is the winner.`);
    }
}


/*backendGameGrid is basically this, 70% of empty places are becoming soft-walls and the rest of it becoming '0'
    ['1','1','1','1','1','1','1','1','1','1','1','1','1','1','1'],
    ['1','x','x',   ,   ,   ,   ,   ,   ,   ,   ,   ,'x','x','1'],
    ['1','x','1',   ,'1',   ,'1',   ,'1',   ,'1',   ,'1','x','1'],
    ['1',   ,   ,   ,   ,   ,   ,   ,   ,   ,   ,   ,   ,   ,'1'],
    ['1',   ,'1',   ,'1',   ,'1',   ,'1',   ,'1',   ,'1',   ,'1'],
    ['1',   ,   ,   ,   ,   ,   ,   ,   ,   ,   ,   ,   ,   ,'1'],
    ['1',   ,'1',   ,'1',   ,'1',   ,'1',   ,'1',   ,'1',   ,'1'],
    ['1',   ,   ,   ,   ,   ,   ,   ,   ,   ,   ,   ,   ,   ,'1'],
    ['1',   ,'1',   ,'1',   ,'1',   ,'1',   ,'1',   ,'1',   ,'1'],
    ['1',   ,   ,   ,   ,   ,   ,   ,   ,   ,   ,   ,   ,   ,'1'],
    ['1','x','1',   ,'1',   ,'1',   ,'1',   ,'1',   ,'1','x','1'],
    ['1','x','x',   ,   ,   ,   ,   ,   ,   ,   ,   ,'x','x','1'],
    ['1','1','1','1','1','1','1','1','1','1','1','1','1','1','1']
];*/