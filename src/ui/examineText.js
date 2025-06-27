import { gameId, guesses, examineText as cachedExamineText, setExamineText } from '../game/state.js';
import { examineTextDiv } from './domElements.js';
import { getExamineText } from '../api.js';

function getBlurredExamineText(examineText, title, guessCount, forceUnblur = false) {
    if (forceUnblur) {
        return examineText;
    }
    if (!examineText || !title) return '';

    const allWords = examineText.split(/\s+/);
    const titleWords = new Set(title.toLowerCase().replace(/[()]/g, '').split(/\s+/).filter(word => word.length > 2));

    if (guessCount < 2) { // Guess 0 and 1
        return examineText.replace(/\w/g, '*');
    }

    if (guessCount >= 7) { // Guess 7+
        return examineText;
    }

    const wordsToUnblur = new Set();
    const nonTitleWords = allWords
        .map(word => ({ original: word, cleaned: word.toLowerCase().replace(/[^a-z]/g, '') }))
        .filter(wordObj => wordObj.cleaned && !titleWords.has(wordObj.cleaned));

    // Sort by length, then alphabetically to ensure consistent unblurring
    nonTitleWords.sort((a, b) => a.cleaned.length - b.cleaned.length || a.cleaned.localeCompare(b.cleaned));

    const totalSteps = 5; // From guess 2 to guess 6
    const currentStep = guessCount - 1; // Guess 2 is step 1
    const unblurPercentage = Math.min(currentStep / totalSteps, 1.0);
    const unblurCount = Math.floor(nonTitleWords.length * unblurPercentage);

    for (let i = 0; i < unblurCount; i++) {
        wordsToUnblur.add(nonTitleWords[i].original);
    }

    let revealedText = allWords.map(word => {
        const cleanedWord = word.toLowerCase().replace(/[^a-z]/g, '');
        if (wordsToUnblur.has(word) || (guessCount >= 6 && !titleWords.has(cleanedWord))) {
            return word;
        } else {
            return word.replace(/\w/g, '*');
        }
    }).join(' ');

    // At guess 6, ensure only title words are blurred
    if (guessCount === 6) {
        revealedText = allWords.map(word => {
            const cleanedWord = word.toLowerCase().replace(/[^a-z]/g, '');
            if (titleWords.has(cleanedWord)) {
                return word.replace(/\w/g, '*');
            }
            return word;
        }).join(' ');
    }

    return revealedText;
}


export async function displayExamineText(forceUnblur = false, text = null, title = null) {
    let textToDisplay = '';
    const guessCount = guesses.length;

    if(text && title) {
        setExamineText({examine: text, title: title})
    }
    let currentExamineText = cachedExamineText;
    if (!currentExamineText) {
        const data = await getExamineText(gameId);
        if (data && data.examine) {
            currentExamineText = data;
            setExamineText(currentExamineText);
        }
    }

    if (currentExamineText) {
        textToDisplay = getBlurredExamineText(currentExamineText.examine, currentExamineText.title, guessCount, forceUnblur);
    }

    if (textToDisplay) {
        examineTextDiv.innerHTML = `Examine: ${textToDisplay}`;
        examineTextDiv.style.display = 'block';
    } else {
        examineTextDiv.style.display = 'none';
    }
}