const formatRange = (range, isDate = false) => {
    if (!range || (range.min === null && range.max === null) || (typeof range.min === 'undefined' && typeof range.max === 'undefined')) {
        return { text: '?', status: '' };
    }

    const min = range.min === null ? -Infinity : range.min;
    const max = range.max === null ? Infinity : range.max;

    if (min === -Infinity && max === Infinity) {
        return { text: '?', status: '' };
    }

    if (min === max) {
        const value = isDate ? new Date(min).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : min;
        return { text: value, status: 'correct' };
    }

    if (max === Infinity) {
        const minValue = isDate ? new Date(min).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : min;
        return { text: `${minValue} &#9650;`, status: 'partial-low' };
    }

    if (min === -Infinity) {
        const maxValue = isDate ? new Date(max).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : max;
        return { text: `${maxValue} &#9660;`, status: 'partial-high' };
    }

    if (isDate) {
        const minDate = new Date(min).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
        const maxDate = new Date(max).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
        return { text: `&#9650;${minDate} ${maxDate} &#9660;`, status: 'partial' };
    } else {
        return { text: `&#9650; ${min} ${max} &#9660;`, status: 'partial' };
    }
};

const prepareCombatStatsViewModel = (combatStats) => {
    if (!combatStats) return null;

    const processCategory = (categoryData, categoryKey) => {
        if (!categoryData) return null;
        const stats = {};
        for (const stat in categoryData) {
            stats[stat] = formatRange(categoryData[stat]);
        }
        return {
            title: categoryKey.replace('_', ' '),
            stats: stats
        };
    };

    return {
        attack: processCategory(combatStats.attack, 'Attack Bonuses'),
        defence: processCategory(combatStats.defence, 'Defence Bonuses'),
        other: processCategory(combatStats.other, 'Other Bonuses')
    };
};

const formatCategoricalRange = (range) => {
    if (!range) {
        return { text: '?', status: '', value: 'unknown' };
    }
    if (range.confirmed) {
        return { text: range.confirmed, status: 'correct', value: range.confirmed };
    }
    if (range.excluded && range.excluded.length > 0) {
        return { text: 'Unknown', status: 'incorrect', value: 'unknown' };
    }
    return { text: '?', status: '', value: 'unknown' };
};

const prepareLevelRequirementsViewModel = (levelRequirement) => {
    if (!levelRequirement) return {};
    if (levelRequirement.none) {
        return { text: 'None', status: 'correct' };
    }

    const requirements = {};
    for (const skill in levelRequirement) {
        const range = levelRequirement[skill];
        if (range.required === false) {
            requirements[skill] = { status: 'incorrect strike-through', text: 'N/A' };
        } else if (range.required) {
            requirements[skill] = formatRange(range);
        }
    }
    return requirements;
};

export const prepareComparisonViewModel = (possibleRanges) => {
    return {
        combatStats: prepareCombatStatsViewModel(possibleRanges.combatStats),
        levelRequirements: prepareLevelRequirementsViewModel(possibleRanges.levelRequirement),
        highAlch: formatRange(possibleRanges.highAlch),
        releaseDate: formatRange(possibleRanges.releaseDate, true),
        gearSlot: formatCategoricalRange(possibleRanges.gearSlot)
    };
};