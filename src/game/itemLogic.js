import { allItems, allItemsNameAndImage, itemTitleMap, gameType, setGameType, possibleRanges, setItemSearchIndex } from './state.js';
import { initializeGame } from './gameInitialization.js';
import { startDailyTimer } from './timer.js';
import { loadGameFromLocalStorage } from '../utils/localStorage.js';
import { GameType } from './constants.js';
import { displayExamineText } from '../ui/examineText.js';
import { updateHealthDisplay } from '../ui/healthDisplay.js';
import { getAllItems } from '../api.js';
import { createSearchIndex } from '../utils/searchIndex.js';

export async function loadItems() {
    try {
        const items = await getAllItems();
        allItems.splice(0, allItems.length, ...items); // Update the shared array
        allItemsNameAndImage.splice(0, allItemsNameAndImage.length, ...items.map(item => ({
            id: item.id,
            title: item.title,
            name: item.title,
            image_local_path: item.image_local_path
        })));

        const searchIndex = createSearchIndex(allItemsNameAndImage);
        setItemSearchIndex(searchIndex);

        allItems.forEach(item => {
            itemTitleMap.set(item.title.toLowerCase(), item);
        });

        setGameType(GameType.DAILY);

        console.log('Items loaded:', allItems.length);
        if (allItems.length > 0) {
            if (!await loadGameFromLocalStorage(displayExamineText, updateHealthDisplay)) {
                await initializeGame(GameType.DAILY); 
            }
            startDailyTimer(); 
        } else {
            console.error('No items loaded. Game cannot be initialized.');
            document.getElementById('feedback').textContent = 'Error: No game data available. Please try again later.';
        }
    } catch (error) {
        console.error('Error loading items:', error);
        document.getElementById('feedback').textContent = 'Error loading game data. Please try again later.';
    }
}


const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item));
    }
    const newObj = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            newObj[key] = deepClone(obj[key]);
        }
    }
    return newObj;
};

function updateNumericRange(current, feedback) {
    const { value, status } = feedback;
    const newRange = current ? { ...current } : { min: null, max: null };

    if (typeof value !== 'number' || isNaN(value)) {
        return newRange;
    }

    switch (status) {
        case 'correct':
            newRange.min = value;
            newRange.max = value;
            break;
        case 'partial-high': { 
            const newUpperBoundary = value;
            if (newRange.max === null || newUpperBoundary < newRange.max) {
                newRange.max = newUpperBoundary;
            }
            break;
        }
        case 'partial-low': { 
            const newLowerBoundary = value;
            if (newRange.min === null || newLowerBoundary > newRange.min) {
                newRange.min = newLowerBoundary;
            }
            break;
        }
    }
    return newRange;
}

function updateCategoricalRange(current, feedback) {
    const { value, status } = feedback;
    const newRange = current ? { ...current } : { confirmed: null, excluded: [] };

    if (status === 'correct') {
        newRange.confirmed = value;
        newRange.excluded = []; 
    } else if (status === 'incorrect') {
        if (!newRange.excluded.includes(value)) {
            newRange.excluded.push(value);
        }
    }
    return newRange;
}

function updateLevelRequirements(current, feedback) {
    const newReqs = current ? deepClone(current) : {};

    if (feedback.status === 'correct' && feedback.value === 'None') {
        return { none: true }; 
    }
    
    if (!feedback.details) {
        return newReqs;
    }

    for (const skill in feedback.details) {
        const skillFeedback = feedback.details[skill];
        const currentSkillRange = newReqs[skill] || { min: 1, max: 99, required: 'unknown' };
        let newSkillRange = { ...currentSkillRange };

        const { value, status } = skillFeedback;

        if (status === 'incorrect strike-through') {
            newSkillRange = { required: false };
        } else {
            newSkillRange.required = true;
            const numericFeedback = { value, status };
            const updatedNumeric = updateNumericRange({min: newSkillRange.min, max: newSkillRange.max}, numericFeedback);
            newSkillRange.min = updatedNumeric.min;
            newSkillRange.max = updatedNumeric.max;
        }
        newReqs[skill] = newSkillRange;
    }

    return newReqs;
}

export function calculateNewRanges(feedback, currentRanges = {}) {
    if (!feedback) {
        console.error("calculateNewRanges called with invalid feedback object.");
        return currentRanges;
    }
    const newRanges = deepClone(currentRanges);

    const getOrCreate = (obj, path) => {
        let current = obj;
        for (const key of path) {
            if (!current[key]) {
                current[key] = {};
            }
            current = current[key];
        }
        return current;
    };

    ['highAlch', 'releaseDate'].forEach(key => {
        if (feedback[key]) {
            const value = key === 'releaseDate' ? new Date(feedback[key].value).getTime() : feedback[key].value;
            newRanges[key] = updateNumericRange(newRanges[key], {...feedback[key], value});
        }
    });

    if (feedback.gearSlot) {
        newRanges.gearSlot = updateCategoricalRange(newRanges.gearSlot, feedback.gearSlot);
    }

    if (feedback.combatStats && feedback.combatStats.details) {
        const combatStatsRanges = getOrCreate(newRanges, ['combatStats']);
        const mapping = {
            attack_bonuses: 'attack',
            defence_bonuses: 'defence',
            other_bonuses: 'other'
        };

        for (const categoryKey in feedback.combatStats.details) {
            const targetCategory = mapping[categoryKey];
            if (targetCategory) {
                const subCategoryRanges = getOrCreate(combatStatsRanges, [targetCategory]);
                const stats = feedback.combatStats.details[categoryKey];
                for (const stat in stats) {
                    subCategoryRanges[stat] = updateNumericRange(subCategoryRanges[stat], stats[stat]);
                }
            }
        }
    }

    if (feedback.levelRequirement) {
        newRanges.levelRequirement = updateLevelRequirements(newRanges.levelRequirement, feedback.levelRequirement);
    }

    if (feedback.options) {
        if (!newRanges.options) {
            newRanges.options = { confirmed: [], excluded: [] };
        }
    }
    return newRanges;
}
