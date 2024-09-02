import frame from './utils/framework.js';
import { updateExplosion1, drawExplosion1, updateExplosion2, drawExplosion2, resetAnimationComplete, playerImageSets, updatePlayer, drawPlayer } from "./utils/animations.js"
import { createElements, playerName } from './utils/elements.js';

const socket = new WebSocket('ws://localhost:3000');

socket.addEventListener('open', () => {
    console.log('WebSocket connection opened.');
});

let countdownStarted = false;
let currentPlayerId;
let currentPlayerLives
let backendGameGrid;
let backendPlayers;
let direction;

socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    const usernameInput = document.querySelector('#username-input');
    const startButton = document.querySelector('#start-button');
    if (data.type === 'max_players_reached') {
        usernameInput.disabled = true;
        startButton.disabled = true;
        swal('Maximum players reached.');
    } else if (data.type === 'game_already_started') {
        usernameInput.disabled = true;
        startButton.disabled = true;
        swal('The game has already started.');
    } else {
        backendGameGrid = data.backendGameGrid;
        backendPlayers = data.backendPlayers;
        if (data.currentPlayer) {
            currentPlayerId = data.currentPlayer.id;
            currentPlayerLives = data.currentPlayer.playerLives;
            direction = data.currentPlayer.direction;
        }
        let playerCount = data.playerCount;
        let seconds = data.seconds;
        let readySeconds = data.readySeconds;
        let chatMessages = data.chatMessages;
        startCountDown(playerCount, seconds, readySeconds)
        if (playerCount < 2 && countdownStarted) {
            resetCountdown();
        }
        if (chatMessages) {
            displayMessage(chatMessages);
        }
    }
});

createElements(socket)

const chatDisplay = document.querySelector('#chat-container');
const gameContent = document.querySelector('#game-container');
const powerUpsExplanations = document.querySelector('#powers-container')
const frontendGameGrid = document.querySelector('#game');
const timer = document.querySelector('#countdown-timer');
const playersInfo = document.querySelector('#players');

chatDisplay.style.display = 'none'; 
gameContent.style.display = 'none';
powerUpsExplanations.style.display = 'none';
timer.style.display = 'none';
playersInfo.style.display = 'none';

function startCountDown(playerCount, seconds, readySeconds) {
    if (playerCount >= 2 && playerName !== undefined) {
        countdownStarted = true;
        chatDisplay.style.display = 'block'; 
        timer.textContent = `${playerCount} players. Lets wait ${seconds} seconds for more players.`;
        if (seconds === 0) {
            startReadyTimer(readySeconds, playerCount);
        }
    }
}

function startReadyTimer(readySeconds, playerCount) {
    timer.textContent = `Game for ${playerCount} players starting in ${readySeconds} seconds`;
    if (readySeconds === 0) {
        timer.remove();
        playersInfo.style.display = 'block';
        gameContent.style.display = 'grid'; 
        powerUpsExplanations.style.display = 'block';
    }
}

function resetCountdown() {
    countdownStarted = false;
    timer.style.display = 'block';
    timer.textContent = 'You are the only one here, but there has to be at least 2 players. Please wait.';
}

const numCols = 15;
let frontendPlayers = {};
let bombAnimations = {};

function createFrontendGameGrid() {
    requestAnimationFrame(createFrontendGameGrid);

    frontendGameGrid.innerHTML = ''; 

    if (backendGameGrid) {
        for (let row = 0; row < backendGameGrid.length; row++) {
            for (let col = 0; col < backendGameGrid[row].length; col++) {
                const cell = frame.createDiv({ class: 'cell' });
                if (backendGameGrid[row][col] === '1') {
                    cell.classList.add('wall');
                } else if (backendGameGrid[row][col] === 'soft-wall') {
                    cell.classList.add('soft-wall');
                } else if (backendGameGrid[row][col] === '0') {
                    cell.classList.remove('soft-wall');
                }else if (backendGameGrid[row][col] === 'bomb') {
                    cell.classList.add('bomb');
                    const bombId = `${row}${col}`;
                    if (!bombAnimations[bombId]) {
                        bombAnimations[bombId] = {        
                            id: bombId,
                            frameCounter: 0,
                            explosionAnimationFrameIndex: 0,
                            animationComplete: false
                        };
                    }
                    cell.setAttribute('data-id', bombId);
                }else if (backendGameGrid[row][col] === 'bomb2') {
                    cell.classList.add('bomb2');
                    resetAnimationComplete()
                } else if (backendGameGrid[row][col] === 'bombs') {
                    cell.classList.add('bombs');
                } else if (backendGameGrid[row][col] === 'flames') {
                    cell.classList.add('flames');
                } else if (backendGameGrid[row][col] === 'speed') {
                    cell.classList.add('speed');
                }
                frontendGameGrid.appendChild(cell);
                createFrontendPlayers(row, col, cell, backendPlayers)
            }
        }
    }  
    if (currentPlayerId) { 
        updateFrontendPlayers( currentPlayerId, currentPlayerLives, direction);
    }

    for (const bombId in bombAnimations) {
        if (bombAnimations.hasOwnProperty(bombId)) {
            const bombAnimation = bombAnimations[bombId];
            const cell = document.querySelector(`[data-id="${bombAnimation.id}"]`);
            if (bombAnimation) {
                updateExplosion1(bombAnimation);
            }
            if (cell) {
                drawExplosion1(cell, bombAnimation);
            }
        }
    }

    const bigBomb = frontendGameGrid.querySelector('.bomb2');
    if (bigBomb) {
        updateExplosion2()
        drawExplosion2(bigBomb)
    }
}
createFrontendGameGrid();

function createFrontendPlayers(row, col, cell, backendPlayers) {
    for (const playerId in backendPlayers) {
        let backendPlayer = backendPlayers[playerId];
        if (backendPlayer && row === backendPlayer.y && col === backendPlayer.x && !backendPlayer.gameover) {
            cell.classList.add(`player-${playerId}`);
        }
    
        if (!frontendPlayers[playerId]) {
            frontendPlayers[playerId] = {
                id: backendPlayer.id,
                row: backendPlayer.y,
                col: backendPlayer.x,
                playerLives: backendPlayer.playerLives,
                playeName: backendPlayer.playerName,
            };
            
            const playerData = frame.createDiv(
                {class: `player-container${playerId}`}, 
                frame.createDiv(
                    {class: `player-${playerId}`}
                ),
                frame.createDiv(
                    {class: 'player-info', 
                    id: `data-${playerId}`},
                    frame.createSpan(
                        {class: 'player-name'}, 
                        `${backendPlayer.playerName}`
                    ),
                    frame.createSpan(
                        {class: 'player-lives'}, 
                        `${backendPlayer.playerLives}`
                    )
                )
            )
            playersInfo.appendChild(playerData)

        } else if (backendPlayer.playerLives <= 0 ) {
            document.querySelector(`#data-${playerId}`).innerHTML = `${backendPlayer.playerName}: GAME OVER!`
            document.querySelector(`#data-${playerId}`).classList.add('game-over');
        } else if (backendPlayer.winner) {
            document.querySelector(`#data-${playerId}`).innerHTML = `${backendPlayer.playerName}: WINNER!`
            document.querySelector(`#data-${playerId}`).classList.add('winner');
        } else {
            document.querySelector(`#data-${playerId}`).innerHTML = `${backendPlayer.playerName}: ${backendPlayer.playerLives} lives`
            frontendPlayers[playerId].row = backendPlayer.y;
            frontendPlayers[playerId].col = backendPlayer.x;
        }
    }
    for (const id in frontendPlayers) {
        if (!backendPlayers[id]) {
            const divToDelete = document.querySelector(`.player-container${id}`)
            if (divToDelete) {
                divToDelete.parentNode.removeChild(divToDelete)
            }
        }
    }
}

let animationFlag = false;
let frames;

function updateFrontendPlayers(currentPlayerId, currentPlayerLives, direction) {
    let currentPlayer = frontendPlayers[currentPlayerId];
    let newY = currentPlayer.row;
    let newX = currentPlayer.col;
    const targetCell = frontendGameGrid.children[newY * numCols + newX];

    if (currentPlayer) {
        const currentPlayerSet = playerImageSets[currentPlayerId - 1];

        switch (direction) {
            case 'right':
                animationFlag = true;
                frames = currentPlayerSet.rightImages;
                break;
            case 'left':
                animationFlag = true;
                frames = currentPlayerSet.rightImages; 
                targetCell.style.transform = 'scaleX(-1)';
                break;
            case 'up':
                animationFlag = true;
                frames = currentPlayerSet.upImages;
                break;
            case 'down':
                animationFlag = true;
                frames = currentPlayerSet.downImages;
                break;
            case 'keyUp':
                animationFlag = false;
                break;
        }

        const currentPlayerCell = frontendGameGrid.querySelector(`.player-${currentPlayerId}`);
        if (currentPlayerCell) {
            currentPlayerCell.classList.remove(`player-${currentPlayerId}`);
            if (animationFlag) {
                updatePlayer(frames.length);
                drawPlayer(currentPlayerCell, frames);
            }
        }

        if (targetCell && !targetCell.classList.contains('wall') && !targetCell.classList.contains('soft-wall') && !targetCell.classList.contains('bomb')) {
            targetCell.classList.add(`player-${currentPlayerId}`);
        }
        if (currentPlayerLives === 0) {
            const currentPlayerCell = frontendGameGrid.querySelector(`.player-${currentPlayerId}`);
            currentPlayerCell.classList.remove(`player-${currentPlayerId}`);
        }

    }
}

const messageInput = document.querySelector('#message-input');
let message = '';

function isChatInputFocused() {
    return (document.activeElement === messageInput);
}

window.addEventListener('keydown', (event) => {
    const messageInputFocused = isChatInputFocused();
    let messageType;

    if (messageInputFocused) {
        messageType = 'chat'
    } else {
        messageType = 'user'
    } 

    switch (event.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
            event.preventDefault(); 
            message = event.key;
            break;
        case ' ':
            message = event.key;
            break;
    }

    if (messageType === 'user') {
        if (message !== '') {
            const keyDownInfo = {
                type: 'user',
                playerName: playerName,
                message: message
            };
            socket.send(JSON.stringify(keyDownInfo));
        }
    }
});

window.addEventListener('keyup', (event) => {
    const currentPlayerCell = frontendGameGrid.querySelector(`.player-${currentPlayerId}`);
    if (currentPlayerCell) {
        currentPlayerCell.style.backgroundPosition = ''; 
    }
    const messageInputFocused = isChatInputFocused();
    let messageType;

    if (messageInputFocused) {
        messageType = 'chat'
    } else {
        messageType = 'user'
    } 

    switch (event.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
            message = 'keyUp';
            break;
    }

    if (messageType === 'user') {
        if (message !== '') {
            const keyUpInfo = {
                type: 'user',
                playerName: playerName,
                message: message
            };
            socket.send(JSON.stringify(keyUpInfo));
        }
    }
});

const messageBox = document.querySelector("#messagebox");
let displayedMessages = new Set();

function displayMessage(chatMessages) {
    for (const messageId in chatMessages) {
        if (chatMessages.hasOwnProperty(messageId)) {
            const uniqueMessageId = messageId + '_' + chatMessages[messageId].playerName;

            if (!displayedMessages.has(uniqueMessageId)) {
                const senderNickname = chatMessages[messageId].playerName;
                const messageText = chatMessages[messageId].content;
                messageBox.value += `${senderNickname}: ${messageText}\n`;

                displayedMessages.add(uniqueMessageId);

                messageBox.scrollTop = messageBox.scrollHeight;
            }
        }
    }
}
