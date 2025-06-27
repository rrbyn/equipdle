import { guesses, currentHealth, dailyGameCompleted, setCurrentHealth, allItems, setDailyGameCompleted, setGameType, gameType, setGameId, resetPossibleRanges, setGameStartTime, setExamineText } from './state.js';
import { INITIAL_HEALTH, GameType } from './constants.js';
import { updateHealthDisplay } from '../ui/healthDisplay.js';
import { saveGameToLocalStorage } from '../utils/localStorage.js';
import {
    guessList, feedbackDiv, itemGuessInput,
    examineTextDiv, submitGuessButton, dailyGameStatusDiv,
    comparisonModalButton
} from '../ui/domElements.js';
import { startGame } from '../api.js';
import { showNewGameWarning } from '../ui/newGameWarningModal.js';

async function startGameLogic(type) {
    setGameStartTime(Date.now());
    guesses.splice(0, guesses.length); 
    guessList.innerHTML = '';
    feedbackDiv.textContent = '';
    itemGuessInput.value = '';
    examineTextDiv.style.display = 'none'; 
    examineTextDiv.innerHTML = ''; 
    setCurrentHealth(INITIAL_HEALTH); 
    updateHealthDisplay(); 
    submitGuessButton.disabled = false; 
    itemGuessInput.disabled = false; 
    dailyGameStatusDiv.textContent = ''; 
    resetPossibleRanges(); 
    comparisonModalButton.style.display = 'none'; 
    setGameType(type);
    setExamineText(null);

    try {
        const { gameId } = await startGame(type);
        setGameId(gameId);
        console.log(`Game started with ID: ${gameId}`);

        if (gameType === GameType.DAILY) { 
            setDailyGameCompleted(false); 
            saveGameToLocalStorage({ health: currentHealth, gameId }); 
        }
    } catch (error) {
        console.error('Error initializing game:', error);
        feedbackDiv.textContent = 'Error initializing game. Please try again later.';
    }
}

export async function initializeGame(type) {
    const isRandomGameInProgress = gameType === GameType.RANDOM && guesses.length > 0;
    console.log(gameType)
    if (isRandomGameInProgress) {
        showNewGameWarning(() => startGameLogic(type));
    } else {
        await startGameLogic(type);
    }
}