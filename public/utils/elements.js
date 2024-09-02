import frame from './framework.js';

let playerName;

function createElements(socket) {
    const body = document.querySelector('#body');
    const bodyContainer = frame.createDiv(
        {id: 'body-container'}
    );
    body.appendChild(bodyContainer);

    const container = frame.createDiv();

    const game = frame.createDiv(
        {id: 'game-container'},
        frame.createDiv({
            id:'game'
        })
    )

    const powerUps = frame.createDiv({id: 'powers-container'},
        frame.createDiv(
            {class: 'usual-bomb'}, 
            frame.createDiv(
                {class: 'description'},
                'Bomb with an explosion range of 1 block in four directions')),
        frame.createDiv(
            {class: 'advanced-bomb'},
            frame.createDiv(
                {class: 'description'},
                'Bomb with an explosion range of 2 blocks in four directions')),
        frame.createDiv({}, 'POWER UPS:'),
        frame.createDiv(
            {class: 'flames'}, 
            frame.createDiv(
                {class: 'description'},
                'Increases explosion range in four directions by 1 block')),
        frame.createDiv(
            {class: 'bombs'}, 
            frame.createDiv(
                {class: 'description'},
                'Increases the amount of bombs dropped at a time by 1')),
        frame.createDiv(
            {class: 'speed'}, 
            frame.createDiv(
                {class: 'description'},
                'Increases movement speed for the next 10 seconds'
            )
        )
    )

    container.appendChild(game);
    container.appendChild(powerUps);

    const rightContainer = frame.createDiv({id: 'container'},
        frame.createDiv({
            class: 'players',
            id:'players'
        }), 
        frame.createDiv({
            id:'chat-container',
            class: 'chat-container'
            },
            frame.createDiv(
                null, 
                'Chat with players'),
            frame.createTextArea(
                {class:'messagebox',
                id:'messagebox'}
            ),
            frame.createDiv(
                {class:'message-container'},
                frame.createDiv(
                    null,
                    frame.createInput({
                        id: 'message-input',
                        class: 'message-input',
                        type: 'text',
                        placeHolder: 'Text here'
                    })
                ),
                frame.createDiv(
                    null,
                    frame.createButton({
                        id: 'send-button',
                        class: 'message-button',
                        eventHandlers: {
                        click: sendMessage
                        },
                    },'Send')
                )
            ),
        )
    )

    const countdownTimer = frame.createDiv({
        id:'countdown-timer'
    })

    const inputContainer = frame.createDiv({
        id: 'input-container',
        class: 'input-container'
        },
        frame.createForm(
            {id: 'username-form'},
            frame.createDiv(
                null,
                frame.createInput({
                    id: 'username-input',
                    type: 'text',
                    placeHolder: 'Username',
                })
            ),
            frame.createDiv(
                {class: 'button-container'},
                frame.createButton({
                    id: 'start-button',
                    eventHandlers: {
                        click: submitUsername
                    },
                },'Start!')
            ) 
        )
    )

    bodyContainer.appendChild(container);
    bodyContainer.appendChild(rightContainer);
    bodyContainer.appendChild(countdownTimer);
    bodyContainer.appendChild(inputContainer);

    const timer = document.querySelector('#countdown-timer');
    const input = document.querySelector('#input-container');

    function submitUsername (event) {
        event.preventDefault();
        playerName = document.querySelector('#username-input').value;

        if (playerName.length > 6) {
        swal("Too long name. Max 6 characters.");
        }

        if (playerName != '' && playerName.length <= 6) {
        const user = {
            type: 'user',
            playerName: playerName,
        };
        socket.send(JSON.stringify(user));

        const player = frame.createDiv(
            {class: 'player-name'},
            `Hello ${playerName}`
        )
        body.appendChild(player)

        input.remove();
        timer.style.display = 'block';
        timer.textContent = 'You are the only one here, but there has to be at least 2 players. Please wait.';
        }
    }

    const messageInput = document.querySelector('#message-input');
    let messageId = 0;
    function sendMessage(event) {
        event.preventDefault();
        const messageContent = messageInput.value;

        const chatMessage = {
            id: messageId++,
            type: 'chat',
            playerName: playerName,
            content: messageContent
        };

        if (messageContent.trim() !== '' && messageContent.length < 50) {
            socket.send(JSON.stringify(chatMessage));
            messageInput.value = "";
        }

        if (messageContent.length > 50) {
            swal("Message exceeds 50 characters. Please limit your message length.");
        }
    }

    messageInput.addEventListener("keydown", (event) => {
        if (event.keyCode === 13) {
            event.preventDefault();
            sendMessage(event);
        }
    });
}

export {createElements, playerName};