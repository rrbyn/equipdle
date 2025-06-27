import { getSkillIconPath, getCombatStatIconPath, getGearSlotIconPath } from '../utils/iconPaths.js';

const renderLevelRequirements = (levelRequirements) => {
    if (levelRequirements.text === 'None') {
        return `<div><span class="guess-category">Level Req:</span> <span class="guess-value ${levelRequirements.status}">None</span></div>`;
    }

    let gridItems = '';
    for (const skill in levelRequirements) {
        const requirement = levelRequirements[skill];
        const skillIconPath = getSkillIconPath(skill);
        gridItems += `
            <div class="level-requirement-item">
                <img src="${skillIconPath}" alt="${skill} icon" class="skill-icon">
                <span class="level-requirement-value ${requirement.status}">${requirement.text}</span>
            </div>
        `;
    }

    return `
        <div class="level-requirements-container">
            <div class="level-requirements-category">
                <div class="level-requirements-category-title">Level Requirements</div>
                <div class="level-requirements-grid">
                    ${gridItems}
                </div>
            </div>
        </div>
    `;
};

const renderMiscInfo = (viewModel) => {
    const { highAlch, releaseDate, gearSlot } = viewModel;
    return `
        <div class="misc-info-container">
            <div>
                <div><span class="guess-category">High Alch:</span> <span class="guess-value ${highAlch.status}">${highAlch.text}</span></div>
                <div><span class="guess-category">Release Date:</span> <span class="guess-value ${releaseDate.status}">${releaseDate.text}</span></div>
            </div>
            <div class="gear-slot-container modal-gear-slot ${gearSlot.status}">
                <img src="${getGearSlotIconPath(gearSlot.value)}" alt="${gearSlot.value} icon" class="gear-slot-icon">
            </div>
        </div>
    `;
};

const renderCombatStats = (combatStats) => {
    if (!combatStats) return '';

    const renderCategory = (category, categoryKey) => {
        if (!category) return '';
        let statsHtml = '';
        for (const stat in category.stats) {
            const formattedRange = category.stats[stat];
            const combatStatIconPath = getCombatStatIconPath(categoryKey, stat);
            statsHtml += `
                <div class="combat-stat-item">
                    <img src="${combatStatIconPath}" alt="${stat} icon" class="combat-stat-icon">
                    <span class="combat-stat-value ${formattedRange.status}">${formattedRange.text}</span>
                </div>
            `;
        }

        const categoryIconPath = getCombatStatIconPath(categoryKey, "bonuses");
        return `
            <div class="combat-stats-category">
                <div class="combat-stats-category-title">
                    <img src="${categoryIconPath}" alt="${categoryKey} icon" class="combat-category-icon">
                    <span title="${category.title}">${category.title}</span>
                </div>
                <div class="combat-stats-grid">${statsHtml}</div>
            </div>
        `;
    };

    const attackStatsHtml = renderCategory(combatStats.attack, 'attack');
    const defenceStatsHtml = renderCategory(combatStats.defence, 'defence');
    const otherStatsHtml = renderCategory(combatStats.other, 'other');

    return `
        <div class="combat-stats-wrapper">
            ${attackStatsHtml}
            ${defenceStatsHtml}
            <div class="bottom-stats-row">
                ${otherStatsHtml}
            </div>
        </div>
    `;
};

export const renderComparisonModal = (viewModel) => {
    const levelReqHtml = renderLevelRequirements(viewModel.levelRequirements);
    const miscInfoHtml = renderMiscInfo(viewModel);
    const combatStatsHtml = renderCombatStats(viewModel.combatStats);

    return `
        <div class="guess-content-wrapper">
            ${levelReqHtml}
            ${miscInfoHtml}
            ${combatStatsHtml}
        </div>
    `;
};