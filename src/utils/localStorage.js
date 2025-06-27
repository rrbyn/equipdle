import { dailyGameCompleted, guesses, setDailyGameCompleted, setCurrentHealth, gameType, setGameType, setGameId, resetPossibleRanges, setPossibleRanges, possibleRanges, examineText, setExamineText } from '../game/state.js';
import { INITIAL_HEALTH, GameType } from '../game/constants.js';
import { displayGuess } from '../ui/guessDisplay.js';
import { getGameState } from '../api.js';
import { calculateNewRanges } from '../game/itemLogic.js';
import { comparisonModalButton, dailyGameStatusDiv, feedbackDiv, guessList, itemGuessInput, submitGuessButton } from '../ui/domElements.js';

export function getTodayDateString() {
    const today = new Date().toISOString("en-US", {timeZone: "UTC"})
    return today.slice(0, 10); // YYYY-MM-DD
}

export function saveGameToLocalStorage({ health, gameId }) {
    const savedStateRaw = localStorage.getItem('dailyEquipdleGame');
    const savedState = savedStateRaw ? JSON.parse(savedStateRaw) : {};
    const today = getTodayDateString();

    const gameState = {
        date: today,
        completed: dailyGameCompleted,
        examine: examineText,
        guesses: guesses,
        gameId: gameId,
        health: health,
        gameType: gameType,
        startTime: (savedState.date === today && savedState.startTime) ? savedState.startTime : Date.now()
    };
    localStorage.setItem('dailyEquipdleGame', JSON.stringify(gameState));
}

export function getDailyGameHistory() {
    const history = localStorage.getItem('dailyEquipdleHistory');
    return history ? JSON.parse(history) : [];
}

export function saveDailyGameToHistory(gameResult) {
    const history = getDailyGameHistory();
    const today = getTodayDateString();
    const existingEntryIndex = history.findIndex(entry => entry.date === today);

    const newResult = {
        date: today,
        won: gameResult.won,
        guesses: gameResult.guesses.map(guess => guess.guess.title),
        itemTitle: gameResult.correctItem.title,
        itemImage: gameResult.correctItem.image_local_path,
        guessesMade: gameResult.guesses.length,
        time: gameResult.time
    };

    if (existingEntryIndex !== -1) {
        history[existingEntryIndex] = newResult;
    } else {
        history.push(newResult);
    }

    localStorage.setItem('dailyEquipdleHistory', JSON.stringify(history));
}

export async function loadGameFromLocalStorage(displayExamineText, updateHealthDisplay) {
    const today = getTodayDateString();
    const history = getDailyGameHistory();
    const todaysGameHistory = history.find(entry => entry.date === today);
    const savedState = localStorage.getItem('dailyEquipdleGame');

    if (todaysGameHistory) {
        const gameState = JSON.parse(savedState);
        if (gameState.date === today && gameState.gameType === GameType.DAILY && gameState.gameId) {
            setGameType(GameType.DAILY);
            setDailyGameCompleted(true);
            setCurrentHealth(gameState.health);
            updateHealthDisplay();

            guessList.innerHTML = '';
            gameState.guesses.forEach(g => displayGuess(g.guess, g.feedback));

            resetPossibleRanges();
            gameState.guesses.forEach(g => {
                const newRanges = calculateNewRanges(g.feedback, possibleRanges);
                setPossibleRanges(newRanges);
            });
            if(gameState.guesses.length >= 2) {
                comparisonModalButton.style.display = 'block';
            }
            feedbackDiv.innerHTML = todaysGameHistory.won
                        ? `Congratulations! You guessed the item: <u><b><a href="${todaysGameHistory.itemImage}" target="_blank" class="item-link">${todaysGameHistory.itemTitle}</a></b></u>!`
                        : `You have been defeated! The item was: <u><b><a href="${todaysGameHistory.itemImage}" target="_blank" class="item-link">${todaysGameHistory.itemTitle}</a></u></b>. Better luck next time, adventurer!`;
            
            submitGuessButton.disabled = true;
            itemGuessInput.disabled = true;
            dailyGameStatusDiv.textContent = 'Daily game completed!';
            displayExamineText(true, gameState.examine.examine, gameState.examine.title);
            return true;
        } else {

            localStorage.removeItem('dailyEquipdleGame');
        }
    }

    if (savedState) {
        const gameState = JSON.parse(savedState);
        if (gameState.date === today && gameState.gameType === GameType.DAILY && gameState.gameId) {
            setGameType(GameType.DAILY);
            setGameId(gameState.gameId);
            setExamineText(gameState.examine);
            const serverGameState = await getGameState(gameState.gameId);
            if (!serverGameState) {
                localStorage.removeItem('dailyEquipdleGame');
                return false;
            }
            guesses.splice(0, guesses.length, ...serverGameState.guesses);
            setCurrentHealth(serverGameState.health);
            updateHealthDisplay();
            guessList.innerHTML = '';
            guesses.forEach(g => displayGuess(g.guess, g.feedback));
            resetPossibleRanges();
            guesses.forEach(g => {
                const newRanges = calculateNewRanges(g.feedback, possibleRanges);
                setPossibleRanges(newRanges);
            });
            if(guesses.length >= 2) {
                comparisonModalButton.style.display = 'block';
            }
            setDailyGameCompleted(false);
            feedbackDiv.textContent = 'Welcome back! Continue guessing.';
            displayExamineText();
            return true;
        } else {
            localStorage.removeItem('dailyEquipdleGame');
        }
    }

    return false;
}