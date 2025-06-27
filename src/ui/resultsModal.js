import { initializeGame } from '../game/gameInitialization.js';
import { GameType } from '../game/constants.js';
import { getDailyGameHistory } from '../utils/localStorage.js';
import { displayHistory } from './historyModal.js';
import { voteOnItem } from '../api.js';
import { historyModal } from './domElements.js';
import { guesses, gameType } from '../game/state.js';

let currentGameID = null;
let yes = 0;
let no = 0;

const resultsModal = document.getElementById('results-modal');
const resultsModalTitle = document.getElementById('results-modal-title');
const closeButton = document.getElementById('close-results-modal');
const resultsItemImage = document.getElementById('results-item-image');
const resultsItemName = document.getElementById('results-item-name');
const resultsGuesses = document.getElementById('results-guesses');
const resultsTime = document.getElementById('results-time');
const newGameButton = document.getElementById('results-new-game-button');
const dailyHistoryButton = document.getElementById('results-daily-history-button');
const voteCountYes = document.getElementById('vote-count-yes');
const voteCountNo = document.getElementById('vote-count-no');
const voteYesButton = document.getElementById('vote-yes-button');
const voteNoButton = document.getElementById('vote-no-button');
const voteDistributionBar = document.getElementById('vote-distribution-bar');
const shareRedditButton = document.getElementById('share-reddit-button');
const shareDiscordButton = document.getElementById('share-discord-button');
const copyPopup = document.getElementById('copy-popup');
const statsDailyGamesPlayed = document.getElementById('stats-daily-games-played');
const statsDayStreak = document.getElementById('stats-day-streak');
const statsWinRate = document.getElementById('stats-win-rate');

let currentStats = null;
let currentCorrectItem = null;

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateVotingDisplay(yesVotes, noVotes) {
    const totalVotes = yesVotes + noVotes;
    const yesPercentage = totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0;
    const noPercentage = totalVotes > 0 ? (noVotes / totalVotes) * 100 : 0;

    voteCountYes.textContent = `${Math.round(yesPercentage)}% Yes`;
    voteCountNo.textContent = `No ${Math.round(noPercentage)}%`;
    voteDistributionBar.style.width = `${yesPercentage}%`;
}

function calculatePlayerStats(dailyGameHistory) {
    const dailyGamesPlayed = dailyGameHistory.length;

    let winCount = 0;
    for (const game of dailyGameHistory) {
        if (game.won) {
            winCount++;
        }
    }
    const winRate = dailyGamesPlayed > 0 ? Math.round((winCount / dailyGamesPlayed) * 100) : 0;

    let dayStreak = 0;
    if (dailyGamesPlayed > 0) {
        const sortedHistory = [...dailyGameHistory].sort((a, b) => new Date(b.date) - new Date(a.date));

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const firstGameDate = new Date(sortedHistory[0].date);
        firstGameDate.setHours(0, 0, 0, 0);

        const diffTime = today.getTime() - firstGameDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 1) {
            dayStreak = 1;
            for (let i = 0; i < sortedHistory.length - 1; i++) {
                const currentEntryDate = new Date(sortedHistory[i].date);
                const nextEntryDate = new Date(sortedHistory[i + 1].date);
                currentEntryDate.setHours(0, 0, 0, 0);
                nextEntryDate.setHours(0, 0, 0, 0);

                const dateDiff = (currentEntryDate.getTime() - nextEntryDate.getTime()) / (1000 * 60 * 60 * 24);

                if (dateDiff === 1) {
                    dayStreak++;
                } else {
                    break;
                }
            }
        }
    }
    return {
        dailyGamesPlayed,
        dayStreak,
        winRate,
    };
}

export function showResultsModal({ won, stats, correctItem, gameId }) {
    currentStats = stats;
    currentCorrectItem = correctItem;
    resultsModalTitle.textContent = won ? 'Victory!' : 'Defeated!';
    resultsItemImage.src = correctItem.image_local_path;
    resultsItemName.innerHTML = `<a href="${correctItem.url}" target="_blank" class="guess-value item-link">${correctItem.title}</a>`;
    resultsGuesses.textContent = stats.guesses;
    resultsTime.textContent = formatTime(stats.time || 0);
    yes = parseInt(correctItem.yes);
    no = parseInt(correctItem.no);
    updateVotingDisplay(yes, no);
    currentGameID = gameId;

    // Reset buttons
    voteYesButton.disabled = false;
    voteNoButton.disabled = false;
    voteYesButton.classList.remove('voted');
    voteNoButton.classList.remove('voted');


    const dailyGameHistory = getDailyGameHistory();
    const playerStats = calculatePlayerStats(dailyGameHistory);
    statsDailyGamesPlayed.textContent = playerStats.dailyGamesPlayed;
    statsDayStreak.textContent = `${playerStats.dayStreak} Days`;
    statsWinRate.textContent = `${playerStats.winRate}%`;

    resultsModal.style.display = 'block';
}

function closeModal() {
    resultsModal.style.display = 'none';
    document.body.classList.remove('desaturate');
}

closeButton.addEventListener('click', closeModal);

function getShareableText(correctItem, platform) {
    const today = new Date();
    const dateString = gameType === GameType.DAILY ? `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}` : "Random Game";

    if (platform === 'discord') {
        const title = `🛡️ Equipdle: ${dateString}`;
        const guessLines = guesses.map(guess => `${guess.feedback.item.status !== 'correct' ? "🟥" : "🟩"} ||${guess.guess.title}||`).join('\n');
        const answerLine = `Answer: ||${correctItem.title}||`;
        return `${title}\n${guessLines}\n\n${answerLine}\nhttps://equipdle.com`;
    }

    if (platform === 'reddit') {
        const title = `**🛡️ Equipdle: ${dateString}**`;
        const guessLines = guesses.map(guess => `${guess.feedback.item.status !== 'correct' ? "🟥" : "🟩"} >!${guess.guess.title}!<`).join('\n\n');
        const answerLine = `**Answer:** >!${correctItem.title}!<`;
        return `${title}\n${guessLines}\n\n${answerLine}\n\nhttps://equipdle.com`;
    }

    // Fallback for any other case
    return `I finished the Equipdle for ${dateString}!`;
}

function handleShareClick(platform, iconElement) {

    if (!currentStats || !currentCorrectItem) return;

    const textToCopy = getShareableText(currentCorrectItem, platform);
    console.log(textToCopy)
    navigator.clipboard.writeText(textToCopy).then(() => {
        const popup = document.getElementById('copy-popup');
        iconElement.classList.add('shaking');
        popup.classList.add('visible');

        setTimeout(() => iconElement.classList.remove('shaking'), 500);
        setTimeout(() => popup.classList.remove('visible'), 2000);

    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Could not copy text to clipboard.');
    });
}

shareRedditButton.addEventListener('click', (e) => handleShareClick('reddit', e.currentTarget));
shareDiscordButton.addEventListener('click', (e) => handleShareClick('discord', e.currentTarget));

newGameButton.addEventListener('click', async () => {
    document.body.classList.remove('desaturate');
    closeModal();
    await initializeGame(GameType.RANDOM);
});

dailyHistoryButton.addEventListener('click', () => {
    document.body.classList.remove('desaturate');
    closeModal();
    displayHistory();
    historyModal.style.display = 'block';
});

voteYesButton.addEventListener('click', async () => {
    if (!currentGameID) return;

    const result = await voteOnItem(currentGameID, 'yes');
    if (result) {
        updateVotingDisplay(yes + 1, no);
        voteYesButton.disabled = true;
        voteNoButton.disabled = true;
        voteYesButton.classList.add('voted');
    }
});

voteNoButton.addEventListener('click', async () => {
    if (!currentGameID) return;

    const result = await voteOnItem(currentGameID, 'no');
    if (result) {
        updateVotingDisplay(yes, no + 1);
        voteYesButton.disabled = true;
        voteNoButton.disabled = true;
        voteNoButton.classList.add('voted');
    }
});