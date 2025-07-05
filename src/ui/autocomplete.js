import { itemGuessInput, guessInputContainer } from './domElements.js';
import { allItemsNameAndImage, itemSearchIndex } from '../game/state.js';

let autocompleteDiv = null;
let suggestionElements = [];
let filteredItems = [];
const MAX_VISIBLE_SUGGESTIONS = 8;
const SUGGESTION_HEIGHT = 46;

import { debounce } from '../utils/debounce.js';

function createSuggestionPool() {
    for (let i = 0; i < MAX_VISIBLE_SUGGESTIONS; i++) {
        const suggestionItem = document.createElement('div');
        suggestionItem.classList.add('autocomplete-item');
        suggestionItem.style.position = 'absolute';
        suggestionItem.style.width = '100%';

        const img = document.createElement('img');
        img.alt = '';
        img.classList.add('autocomplete-item-image');

        const text = document.createElement('span');

        suggestionItem.appendChild(img);
        suggestionItem.appendChild(text);
        suggestionElements.push(suggestionItem);
    }
}

export function createAutocompleteDropdown() {
    if (autocompleteDiv) {
        autocompleteDiv.remove();
    }
    autocompleteDiv = document.createElement('div');
    autocompleteDiv.id = 'autocomplete-dropdown';
    autocompleteDiv.style.width = itemGuessInput.offsetWidth + 'px';
    autocompleteDiv.style.overflowY = 'auto';
    guessInputContainer.appendChild(autocompleteDiv);

    const inputRect = itemGuessInput.getBoundingClientRect();
    const containerRect = guessInputContainer.getBoundingClientRect();
    autocompleteDiv.style.top = (inputRect.bottom - containerRect.top) + 'px';
    autocompleteDiv.style.left = (inputRect.left - containerRect.left) + 'px';

    if (suggestionElements.length === 0) {
        createSuggestionPool();
    }

    autocompleteDiv.addEventListener('scroll', renderVisibleSuggestions);
}

function renderVisibleSuggestions() {
    if (!autocompleteDiv) return;

    const resultsHeight = filteredItems.length * SUGGESTION_HEIGHT;
    autocompleteDiv.style.height = `${resultsHeight}px`;

    const scrollTop = autocompleteDiv.scrollTop;
    const startIndex = Math.floor(scrollTop / SUGGESTION_HEIGHT);

    autocompleteDiv.innerHTML = '';

    const spacer = document.createElement('div');
    spacer.style.height = `${filteredItems.length * SUGGESTION_HEIGHT}px`;
    autocompleteDiv.appendChild(spacer);

    const endIndex = Math.min(startIndex + MAX_VISIBLE_SUGGESTIONS, filteredItems.length);

    for (let i = startIndex; i < endIndex; i++) {
        const item = filteredItems[i];
        const templateItem = suggestionElements[i % MAX_VISIBLE_SUGGESTIONS];
        
        const newSuggestionItem = templateItem.cloneNode(true);

        newSuggestionItem.style.top = `${i * SUGGESTION_HEIGHT}px`;
        const img = newSuggestionItem.querySelector('img');
        img.src = item.image_local_path;
        img.alt = item.name;
        const text = newSuggestionItem.querySelector('span');
        text.textContent = item.name;

        newSuggestionItem.addEventListener('click', () => {
            itemGuessInput.value = item.name;
            closeAutocomplete();
        });

        autocompleteDiv.appendChild(newSuggestionItem);
    }
}

export function updateAutocompleteSuggestions() {
    const inputText = itemGuessInput.value.toLowerCase();
    const trimmedInput = inputText.trim();

    if (!trimmedInput) {
        closeAutocomplete();
        return;
    }

    if (!autocompleteDiv || !document.body.contains(autocompleteDiv)) {
        createAutocompleteDropdown();
    }

    const normalizedQuery = trimmedInput.replace(/[^a-z0-9\s]+/g, ' ').trim();
    const searchTerms = normalizedQuery.split(/\s+/).filter(Boolean);

    let intersection = new Set();

    if (searchTerms.length > 0) {
        const firstTermResults = itemSearchIndex.get(searchTerms[0]);
        if (firstTermResults) {
            intersection = new Set(firstTermResults);

            for (let i = 1; i < searchTerms.length; i++) {
                const termResults = itemSearchIndex.get(searchTerms[i]);
                if (termResults && termResults.size > 0) {
                    intersection = new Set([...intersection].filter(item => termResults.has(item)));
                } else {
                    intersection.clear();
                    break;
                }
            }
        }
    }
    
    if (intersection.size === 0 && searchTerms.length === 1) {
        const term = searchTerms[0];
        if (term.length > 3) {
             const key = term.substring(term.length - 3);
             const fallbackCandidates = itemSearchIndex.get(key) || new Set();
             intersection = new Set([...fallbackCandidates].filter(item => {
                const normalizedItemName = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '');
                return normalizedItemName.includes(term);
            }));
        }
    }

    filteredItems = Array.from(intersection);

    filteredItems.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aStartsWith = aName.startsWith(trimmedInput);
        const bStartsWith = bName.startsWith(trimmedInput);

        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return aName.localeCompare(bName);
    });

    if (filteredItems.length === 0) {
        closeAutocomplete();
        return;
    }

    renderVisibleSuggestions();
    autocompleteDiv.scrollTop = 0;
}

function closeAutocomplete() {
    if (autocompleteDiv) {
        autocompleteDiv.remove();
        autocompleteDiv = null;
    }
}

export const debouncedUpdateAutocompleteSuggestions = debounce(updateAutocompleteSuggestions, 50);

export function setupAutocompleteCloseListener() {
    document.addEventListener('click', (event) => {
        if (autocompleteDiv && !itemGuessInput.contains(event.target) && !autocompleteDiv.contains(event.target)) {
            closeAutocomplete();
        }
    });
}