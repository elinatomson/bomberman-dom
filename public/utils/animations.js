const frameDurations = [170, 10, 10, 10, 10, 10, 10, 10]; 
let frameCounter = 0;

const explosionFrames1 = [
    '-280px -880px', 
    '-400px -880px', 
    '-440px -880px', 
    '-480px -880px', 
    '-520px -880px', 
    '-400px -920px', 
    '-440px -920px', 
    '-480px -920px', 
];

function updateExplosion1(bombAnimation) {
    bombAnimation.frameCounter++;
    if (bombAnimation.frameCounter >= frameDurations[bombAnimation.explosionAnimationFrameIndex]) {
        bombAnimation.frameCounter = 0; 
        if (bombAnimation.explosionAnimationFrameIndex < explosionFrames1.length - 1) {
            bombAnimation.explosionAnimationFrameIndex++;
        } else {
            bombAnimation.animationComplete = true;
        }
    }
}

function drawExplosion1(cell, bombAnimation) {
    if (!bombAnimation.animationComplete) {
        cell.style.backgroundPosition = explosionFrames1[bombAnimation.explosionAnimationFrameIndex];
    } else {
        cell.style.backgroundImage = 'none';
    }
}

const frameDurations2 = [170, 10, 10, 10, 10, 10, 10, 10]; 
let frameCounter2 = 0;
let explosionAnimationFrameIndex2 = 0; 
let animationComplete2 = false;
const explosionFrames2 = [
    '-360px -880px', 
    '-400px -880px', 
    '-440px -880px', 
    '-480px -880px', 
    '-520px -880px', 
    '-400px -920px', 
    '-440px -920px', 
    '-480px -920px', 
];

function updateExplosion2() {
    frameCounter2++;
    if (frameCounter2 >= frameDurations2[explosionAnimationFrameIndex2]) {
        frameCounter2 = 0; 
        if (explosionAnimationFrameIndex2 < explosionFrames2.length - 1) {
            explosionAnimationFrameIndex2++;
        } else {
            explosionAnimationFrameIndex2 = 0; 
            animationComplete2 = true; 
        }
    }
}

function drawExplosion2(cell) {
    if (!animationComplete2) {
        cell.style.backgroundPosition = explosionFrames2[explosionAnimationFrameIndex2];
    } else {
        cell.style.backgroundImage = 'none'; 
    }
}

function resetAnimationComplete() {
    animationComplete2 = false;
}

const playerImageSets = [
    {
        rightImages: ['-160px -40px', '-200px -40px', '-240px -40px', '-280px -40px'],
        downImages: ['-40px -40px', '-80px -40px'],
        upImages: ['-80px -120px', '-120px -120px'],
    },
    {
        rightImages: ['-160px -480px', '-200px -480px', '-240px -480px', '-280px -480px'],
        downImages: ['-40px -480px', '-80px -480px'],
        upImages: ['-80px -560px', '-120px -560px'],
    },
    {
        rightImages: ['-480px -40px', '-520px -40px', '-560px -40px', '-600px -40px'],
        downImages: ['-360px -40px', '-400px -40px'],
        upImages: ['-400px -120px', '-440px -120px'],
    },
    {
        rightImages: ['-480px -480px', '-520px -480px', '-560px -480px', '-600px -480px'],
        downImages: ['-360px -480px', '-400px -480px'],
        upImages: ['-400px -560px', '-440px -560px'],
    },
]
let playerFrameIndex = 0;

function updatePlayer (framesLength) {
    frameCounter++;
    if (frameCounter % 5 === 0) {
        playerFrameIndex = (playerFrameIndex + 1) % framesLength; 
    }
}

function drawPlayer(cell, frames) {
    cell.style.backgroundPosition = frames[playerFrameIndex];
}
  
export { updateExplosion1, drawExplosion1, updateExplosion2, drawExplosion2, resetAnimationComplete, playerImageSets, updatePlayer, drawPlayer };