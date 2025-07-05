export let allItems = [];
export let allItemsNameAndImage = [];
export let itemTitleMap = new Map();
export let guesses = [];
export let dailyGameCompleted = false;
export let timerInterval;
export let currentHealth;
export let gameType;
export let gameId;
export let possibleRanges = {};
export let gameStartTime;
export let examineText = null;
export let itemSearchIndex = null;

export function setItemSearchIndex(index) {
    itemSearchIndex = index;
}

export function setDailyGameCompleted(value) {
    dailyGameCompleted = value;
}

export function setTimerInterval(value) {
    timerInterval = value;
}

export function setCurrentHealth(value) {
    currentHealth = value;
}

export function setGameType(value) {
    gameType = value;
}

export function setGameId(value) {
    gameId = value;
}

export function setGameStartTime(value) {
    gameStartTime = value;
}

export function resetPossibleRanges() {
    possibleRanges = {};
}

export function setPossibleRanges(newRanges) {
    possibleRanges = newRanges;
}

export function setExamineText(text) {
    examineText = text;
}