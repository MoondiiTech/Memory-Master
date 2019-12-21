const DOMselections = {
    'container': document.getElementById('container'),
    'lives': document.getElementById('lives'),
    'level': document.getElementById('level'),
    'startBtn': document.getElementById('startBtn'),
    'saveBtn': document.getElementById('saveBtn'),
    'gameSection': document.querySelector('.game'),
    'startSection': document.querySelector('.start'),
    'endSection': document.querySelector('.end'),
    'scoreText': document.getElementById('scoreText'),
    'userName': document.getElementById('nameInput'),
    'formSection': document.getElementById('form-container'),
    'leaderboardSection': document.querySelector('.leaderboard-container'),
    'leaderboard': document.getElementById('leaderboard'),
    'restartBtn': document.getElementById('restart'),
}
let data = {
    'level': 1,
    'totalTiles': 9,
    'tilesToAdd': 9,
    'gridDimensions': 3,
    'options': 3,
    'correctTiles': [],
    'attempts': 3,
    'lives': 3,
    'currentTile': 0,
    'openedTiles': [],
    'tilesToFill': [],
    'gameStarted': false,
    'memorizeWindow': 1500,
    'topPlayers': {
        'names': [],
        'scores': []
    },
    'name': '',
}
// adding the boxes
let addBoxes = () => {
    let html = `
    <div class="box-container">
        <div class="box box--front">
        <div class="filler"></div>
    </div>
        <div class="box box--back">
        <div class="boxtext"></div>
    </div>
    </div>
    `
    DOMselections.container.insertAdjacentHTML('beforeend', html);
}

// Creating initial boxes
let makeBoxes = () => {
    for (let i = 0; i < data.tilesToAdd; i++) {
        addBoxes();
    }
}

let fillCorrectTiles = () => {
    // Populating the correctTiles array
    for (let i = 0; i < data.options; i++) {
        data.correctTiles.push(i);
    }
    // Best way to fill an array with unique random numbers
    let randomNumArr = [];
    while (randomNumArr.length < data.totalTiles) {
        let r = Math.floor(Math.random() * data.totalTiles);
        if (randomNumArr.indexOf(r) === -1) {
            randomNumArr.push(r);
        }
    }
    // Filling up the correctTiles in the general tiles using unique random number as a index 
    for (let i = 0; i < data.options; i++) {
        data.tilesToFill.push(document.querySelectorAll('.boxtext')[randomNumArr[i]]);
        data.tilesToFill[i].innerHTML = data.correctTiles[i];
    }
}


//Initial flip animation sequence
let initialFlipAnimation = () => {
    setTimeout(() => {
        flipTiles();
    }, 500);
    setTimeout(() => {
        reverseFlipTiles();
        data.gameStarted = true;
    }, data.memorizeWindow);
}

// IF guess is the first element of the correctTiles array, score +1 and the number is removed else lives-1
let checkGuess = (guess) => {
    if (data.correctTiles.indexOf(guess) === 0) {
        data.correctTiles.splice(0, 1);
        return true;
    } else {
        data.attempts--;
        return false;
    }
}
// Flip Correct Tiles
let flipTiles = () => {
    for (let i = 0; i < data.options; i++) {
        data.tilesToFill[i].parentElement.classList.add('box--backflip');
        data.tilesToFill[i].parentElement.previousElementSibling.classList.add('box--frontflip');
    }
}
// Reverse Flip Correct Tiles
let reverseFlipTiles = () => {
    for (let i = 0; i < data.options; i++) {
        data.tilesToFill[i].parentElement.classList.remove('box--backflip');
        data.tilesToFill[i].parentElement.previousElementSibling.classList.remove('box--frontflip');
    }
}
// Reverse Flip All Opened Tiles
let reverseFlipAll = () => {
    for (let i = 0; i < data.openedTiles.length; i++) {
        data.openedTiles[i].classList.remove('box--frontflip');
        data.openedTiles[i].nextElementSibling.classList.remove('box--backflip');
    }
}
// Update the Lives and Level UI numbers
let updateLivesUI = () => {
    DOMselections.lives.innerHTML = `Lives: <span class= "num">${data.lives}</span>`;
}
let updateLevelUI = () => {
    DOMselections.level.innerHTML = `Level: <span class= "num">${data.level}</span>`;
}

// transform boxes and conditions based on level
let levelTransform = () => {
    if (data.level === 3 || data.level === 6 || data.level === 9 || data.level === 14 || data.level === 19 || data.level === 24) {
        data.gridDimensions++;
        // On the next level, I did not clear innerHTML of boxes but instead, added the necessarry tiles with this 
        data.tilesToAdd = Math.pow(data.gridDimensions, 2) - data.totalTiles;
        data.totalTiles += data.tilesToAdd;
        // Changing grid system
        DOMselections.container.style.gridTemplateColumns = `repeat(${data.gridDimensions},1fr)`;
        makeBoxes();
    }
}
let clearArrayDatas = () => {
    data.correctTiles = [];
    data.tilesToFill = [];
    data.openedTiles = [];
}

// Check if won
let winningCondition = () => {
    if (data.correctTiles.length <= 0) {
        data.gameStarted = false;
        setTimeout(() => {
            data.level++;
            updateLevelUI();
            // To ensure that tile options keep going too much in case level is maxed
            if (data.level <= 26) {
                data.options++;
                data.memorizeWindow += 1000;
            }
            winSetUp();
        }, 1000);

    }
}
//Check if user has used all attempts if so, -1 life
let resetLevel = () => {
    if (data.attempts <= 0) {
        data.gameStarted = false;
        data.lives--;
        updateLivesUI();
        setTimeout(() => {
            loseSetUp();
        }, 1000);
    }
}
// Check if lost
let losingCondition = () => {
    if (data.lives <= 0) {
        // After 1 sec, hide game section, show end section and update score text of end section
        setTimeout(() => {
            DOMselections.endSection.classList.remove('hide');
            DOMselections.gameSection.classList.add('hide');
            // Level is basically the score so..
            DOMselections.scoreText.innerText = `Score: ${data.level}`;
        }, 1000);
    }
}
// Clear style and values of tiles
let clear = () => {
    // Clearing all previous tiles to its initial state
    document.querySelectorAll('.boxtext').forEach((e) => {
        e.innerHTML = '';
        e.parentElement.style.backgroundColor = '#ffffff';
    });
}

// Read userInput
let readInput = () => {
    data.name = DOMselections.userName.value;
}
// Check if score fits into leaderboard, return position number if true else, return NaN
let compareWithTopScores = () => {
    let index = -1;
    let once = true;
    for (let i = 0; i < data.topPlayers.names.length; i++) {
        if (data.level >= data.topPlayers.scores[i] && once) {
            index = i;
            once = false;
        }
    }
    if (index === -1 && data.topPlayers.names.length >= 3) {
        return NaN;
    } else if (index === -1 && data.topPlayers.scores.length < 3) {
        return index = data.topPlayers.scores.length;
    } else {
        return index;
    }
}
let checkScore = () => {
    if (!isNaN(compareWithTopScores())) {
        // Push score and name into proper place
        let index = compareWithTopScores();
        data.topPlayers.scores.splice(index, 0, data.level);
        data.topPlayers.names.splice(index, 0, data.name);
        // There cannot be 4+ people on leaderboards
        if (data.topPlayers.names.length >= 4) {
            data.topPlayers.names.splice(3, 1);
            data.topPlayers.scores.splice(3, 1);
        }

        // Render top scores 
        for (let i = 0; i < data.topPlayers.names.length; i++) {
            renderTopScores(data.topPlayers.names[i], data.topPlayers.scores[i], i, index);

        }
        // IF compareWithTopScores return NaN ,render loser
    } else {
        // Render top scores and loser
        for (let i = 0; i < data.topPlayers.names.length; i++) {
            renderTopScores(data.topPlayers.names[i], data.topPlayers.scores[i], i);
        }
        renderLoser(data.name, data.level);
    }
    saveData();
}
// Render each top scores
let renderTopScores = (name, score, rank, newScorePos) => {
    let topPlayersHTML = '';
    let speed = ['faster', 'fast', ''];

    if ((rank === newScorePos) || data.topPlayers.scores.length === 1) {
        topPlayersHTML = `
        <div class="rank animated ${speed[rank]} fadeInRightBig">
            <img src="img/${rank}-medal.svg" alt="medal" class="smallImage">
            <p class="rankText">${name} 
                <span class="rankScore">${score} <img src="img/new.svg" alt="newIcon" class="new smallImage animated repeatTwice swing">
                </span>
            </p>
        </div>
        `;
    } else {
        topPlayersHTML = `
        <div class="rank animated ${speed[rank]} fadeInRightBig">
            <img src="img/${rank}-medal.svg" alt="medal" class="smallImage">
            <p class="rankText">${name} 
                <span class="rankScore">${score}
                </span>
            </p>
        </div>
        `;
    }

    DOMselections.leaderboard.insertAdjacentHTML('beforeend', topPlayersHTML);
}

// Render loser
let renderLoser = (name, score) => {
    let loserHTML = `
    <div class="rank animated slowest fadeInRightBigHinge">
        <img src="img/loser.png" alt="numberFour" class="loser">
        <p class="rankText">${name}
            <span class="rankScore">${score}</span>
        </p>
    </div>
    `;
    DOMselections.leaderboard.insertAdjacentHTML('beforeend', loserHTML);
    DOMselections.restartBtn.classList.add('delay-4s');
}

// General setUp
let setUp = () => {
    fillCorrectTiles();
    initialFlipAnimation();
}
// Level SetUp
let winSetUp = () => {
    reverseFlipAll();
    // This prevents numbers changing before flip animation finishes
    setTimeout(() => {
        clear();
        levelTransform();
        clearArrayDatas();
        data.attempts = 3;
        setUp();
    }, 200);
}
// reset Level
let loseSetUp = () => {
    reverseFlipAll();
    // This prevents numbers changing before flip animation finishes
    setTimeout(() => {
        clear();
        clearArrayDatas();
        data.attempts = 3;
        setUp();
    }, 200);
}

// Game SetUp
let gameSetUp = () => {
    makeBoxes();
    setUp();
    readData();
}
// Save data
let saveData = () => {
    localStorage.setItem('scoreArr', JSON.stringify(data.topPlayers.scores));
    localStorage.setItem('namesArr', JSON.stringify(data.topPlayers.names));
}

// Read data
let readData = () => {
    const scores = JSON.parse(localStorage.getItem('scoreArr'));
    const names = JSON.parse(localStorage.getItem('namesArr'));
    if (names) data.topPlayers.names = names;
    if (scores) data.topPlayers.scores = scores;
}
// EVENT LISTENERS

DOMselections.container.addEventListener('click', e => {

    // When box is clicked, flip it by adding a class 
    if (e.target.closest('.box--front')) {
        if (data.gameStarted) {
            data.openedTiles.push(e.target.parentNode);
            e.target.parentNode.classList.add('box--frontflip');
            e.target.parentNode.nextElementSibling.classList.add('box--backflip');

            // Getting the value of flipped box
            data.currentTile = parseInt(e.target.parentNode.nextElementSibling.querySelector('.boxtext').innerHTML);

            if (!checkGuess(data.currentTile)) {
                // IF incorrect guess does not contain number, color it, else, flip it back after 0.5sec
                if (isNaN(data.currentTile)) {
                    e.target.parentNode.nextElementSibling.style.backgroundColor = '#222831';
                } else {
                    setTimeout(() => {
                        e.target.parentNode.classList.remove('box--frontflip');
                        e.target.parentNode.nextElementSibling.classList.remove('box--backflip');
                    }, 500);
                };
            }
            winningCondition();
            resetLevel();
            losingCondition();
        } else {
            // Highlight box when it is clicked while unclickable
            e.target.parentNode.classList.add('boxHighlight');
            setTimeout(() => {
                e.target.parentNode.classList.remove('boxHighlight');
            }, 200);
        }
    }
})

// START BUTTON
DOMselections.startBtn.addEventListener('click', () => {
    // When start button is clicked, show game and hide start section
    DOMselections.gameSection.classList.toggle('hide');
    DOMselections.startSection.classList.toggle('hide');
    gameSetUp();
})


// Save Score and User Name on save button click

let save = () => {
    if (DOMselections.userName.value !== '' && DOMselections.userName.value !== null) {
        readInput();
        checkScore();
        DOMselections.leaderboardSection.classList.remove('hide');
        DOMselections.formSection.classList.add('hide');
    }
}

DOMselections.saveBtn.addEventListener('click', (e) => {
    e.preventDefault();
    save();
})
DOMselections.saveBtn.addEventListener('keydown', (e) => {
    if (e.keyCode === 13 || e.which === 13) {
        // Prevents form submission on enter
        e.preventDefault();
        save();
    }
})