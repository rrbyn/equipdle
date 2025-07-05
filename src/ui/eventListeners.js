import {
    itemGuessInput, submitGuessButton, newGameButton, dailyGameButton,
    feedbackDiv, dailyGameStatusDiv, settingsButton,
    comparisonModalButton
} from './domElements.js';
import { guesses, currentHealth, dailyGameCompleted, itemTitleMap, setCurrentHealth, setDailyGameCompleted, gameType, gameId, gameStartTime, setPossibleRanges } from '../game/state.js';
import { createGuessHTML, displayGuess } from './guessDisplay.js';
import { updateHealthDisplay } from './healthDisplay.js';
import { GameType } from '../game/constants.js';
import { displayExamineText } from './examineText.js';
import { saveGameToLocalStorage, loadGameFromLocalStorage, saveDailyGameToHistory } from '../utils/localStorage.js';
import { initializeGame } from '../game/gameInitialization.js';
import { debouncedUpdateAutocompleteSuggestions, setupAutocompleteCloseListener } from './autocomplete.js';
import { setupHistoryModalListeners } from './historyModal.js';
import { submitGuess } from '../api.js';
import { calculateNewRanges } from '../game/itemLogic.js';
import { playWinAnimation, playLossAnimation } from './endGameAnimations.js';
import { showResultsModal } from './resultsModal.js';
import { showComparisonModal } from './comparisonModal.js';
import { playWinSound, playLossSound, playDamageSound } from './audioManager.js';
import { getSetting } from '../ui/settings.js';
import { showSettingsModal, setupSettingsModalListeners } from './settingsModal.js';
import { possibleRanges } from '../game/state.js';
import { showNewGameWarning } from './newGameWarningModal.js';

function flashBackgroundColor(color, duration = 1400) {
    if (getSetting('screenFlashDisabled')) {
        return;
    }
    const flashOverlay = document.createElement('div');
    flashOverlay.style.position = 'fixed';
    flashOverlay.style.top = '0';
    flashOverlay.style.left = '0';
    flashOverlay.style.width = '100%';
    flashOverlay.style.height = '100%';
    flashOverlay.style.backgroundColor = color;
    flashOverlay.style.opacity = '0.3';
    flashOverlay.style.zIndex = '9998'; // Below modal but above everything else
    flashOverlay.style.transition = `opacity ${duration}ms ease-out`;

    document.body.appendChild(flashOverlay);

    setTimeout(() => {
        flashOverlay.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(flashOverlay);
        }, duration);
    }, 100);
}

export function setupEventListeners() {
    itemGuessInput.addEventListener('input', debouncedUpdateAutocompleteSuggestions);
    setupAutocompleteCloseListener();
    setupHistoryModalListeners();
    setupSettingsModalListeners();

    settingsButton.addEventListener('click', showSettingsModal);

    comparisonModalButton.addEventListener('click', () => {
        showComparisonModal(possibleRanges);
    });

    submitGuessButton.addEventListener('click', async () => {
        const guessText = itemGuessInput.value.trim();
        if (!guessText) {
            feedbackDiv.textContent = 'Please enter an item name.';
            return;
        }

        const guessedItem = itemTitleMap.get(guessText.toLowerCase());

        if (!guessedItem) {
            feedbackDiv.textContent = 'Item not found. Please try again.';
            return;
        }

        itemGuessInput.value = '';
        submitGuessButton.disabled = true;
        itemGuessInput.disabled = true;
        const pendingGuessElement = displayGuess(guessedItem, null, true); // Display pending state

        try {

            const { feedback, health, fullGuessItem, currentItem } = await submitGuess(gameId, guessedItem.id);

            guesses.push({ guess: fullGuessItem, feedback: feedback });
            
            pendingGuessElement.innerHTML = createGuessHTML(fullGuessItem, feedback);
            pendingGuessElement.classList.remove('pending-guess');

            setCurrentHealth(health);
            updateHealthDisplay();
            const newRanges = calculateNewRanges(feedback, possibleRanges);
            setPossibleRanges(newRanges);

            if (guesses.length >= 2) {
                comparisonModalButton.style.display = 'block';
            }

            if (feedback.item.status === 'correct' || health <= 0) {
                const correctItem = currentItem;
                const won = feedback.item.status === 'correct';
                feedbackDiv.innerHTML = '';

                setDailyGameCompleted(true);
                dailyGameStatusDiv.textContent = 'Daily game ended.';
                displayExamineText(true);

                if (won) {
                    playWinSound();
                    flashBackgroundColor('gold');
                    await playWinAnimation();
                } else {
                    playLossSound();
                    flashBackgroundColor('red');
                    document.body.classList.add('desaturate');
                    await playLossAnimation();
                    document.body.classList.remove('desaturate');
                }

                const timeElapsed = Math.floor((Date.now() - gameStartTime) / 1000);

                if (gameType === GameType.DAILY) {
                    saveDailyGameToHistory({
                        won,
                        guesses: guesses,
                        correctItem: correctItem,
                        time: timeElapsed
                    });
                }
                showResultsModal({
                    won,
                    stats: {
                        guesses: guesses.length,
                        time: timeElapsed
                    },
                    correctItem,
                    gameId
                });

            } else {
                submitGuessButton.disabled = false;
                itemGuessInput.disabled = false;
                itemGuessInput.focus();

                playDamageSound();
                feedbackDiv.textContent = 'Keep guessing!';
                displayExamineText(false);
            }
            if (gameType === GameType.DAILY) {
                saveGameToLocalStorage({ health: currentHealth, gameId });
                console.log(`Saved daily game after guess.`);
            }
        } catch (error) {
            console.error('Error submitting guess:', error);
            feedbackDiv.textContent = 'Error submitting guess. Please try again later.';
            
            if (pendingGuessElement && pendingGuessElement.parentNode) {
                pendingGuessElement.parentNode.removeChild(pendingGuessElement);
            }
            
            submitGuessButton.disabled = false;
            itemGuessInput.disabled = false;
            itemGuessInput.focus();
        }
    });
    async function newGameWrapper() {
        if (!await loadGameFromLocalStorage(displayExamineText, updateHealthDisplay)) {
            await initializeGame(GameType.DAILY);
        }
        dailyGameStatusDiv.textContent = '';
    }
    newGameButton.addEventListener('click', async () => {
        await initializeGame(GameType.RANDOM);
        document.body.classList.remove('desaturate');
        dailyGameStatusDiv.textContent = 'Playing a random game.';
    });
    dailyGameButton.addEventListener('click', async () => {
        const isRandomGameInProgress = gameType === GameType.RANDOM && guesses.length > 0;
        console.log(isRandomGameInProgress)
        if (isRandomGameInProgress) {
            showNewGameWarning(() => newGameWrapper());
        } else {
            await newGameWrapper();
        }
        document.body.classList.remove('desaturate');
        
    });
}