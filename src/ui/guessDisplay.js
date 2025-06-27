import { guessList } from './domElements.js';
import { getSkillIconPath, getCombatStatIconPath, getGearSlotIconPath } from '../utils/iconPaths.js';

export function createGuessHTML(guess, feedback) {
    let attackStatsHtml = '';
    let defenceStatsHtml = '';
    let otherStatsHtml = '';

    const combatStatCategories = {
        'attack_bonuses': 'Attack Bonuses',
        'defence_bonuses': 'Defence Bonuses',
        'other_bonuses': 'Other Bonuses'
    };

    if (feedback.combatStats && feedback.combatStats.details) {
        for (const categoryKey in combatStatCategories) {
            const categoryTitle = combatStatCategories[categoryKey];
            let currentCategoryHtml = '';
            const categoryDetails = feedback.combatStats.details[categoryKey];
    
            if (categoryDetails) {
                for (const stat in categoryDetails) {
                    const statData = categoryDetails[stat];
                    const statValue = statData.value;
                    const statStatus = statData.status;
                    const statusArrow = statStatus === 'partial-high' ? ' &#9660;' : (statStatus === 'partial-low' ? ' &#9650;' : '');
                    let statDisplayStatus = statStatus;
                    if (statData.isCloseMatch && statStatus !== 'correct') {
                        statDisplayStatus += ' close-match';
                    }
                    const combatStatIconPath = getCombatStatIconPath(categoryKey.replace('_bonuses', ''), stat);
                    currentCategoryHtml += `
                        <div class="combat-stat-item">
                            <img src="${combatStatIconPath}" alt="${stat} icon" class="combat-stat-icon">
                            <span class="combat-stat-value ${statDisplayStatus}">${statValue}${statusArrow}</span>
                        </div>
                    `;
                }
            }

            if (categoryKey === 'attack_bonuses') {
                attackStatsHtml = `
                    <div class="combat-stats-category">
                        <div class="combat-stats-category-title">
                            <img src="${getCombatStatIconPath(categoryKey.replace('_bonuses', ''), "bonuses")}" alt="${categoryKey.replace('_bonuses', '')} icon" class="combat-category-icon">
                            <span title="${categoryTitle}">${categoryTitle}</span>
                        </div>
                        <div class="combat-stats-grid">${currentCategoryHtml}</div>
                    </div>
                `;
            } else if (categoryKey === 'defence_bonuses') {
                defenceStatsHtml = `
                    <div class="combat-stats-category">
                        <div class="combat-stats-category-title">
                            <img src="${getCombatStatIconPath(categoryKey.replace('_bonuses', ''), "bonuses")}" alt="${categoryKey.replace('_bonuses', '')} icon" class="combat-category-icon">
                            <span title="${categoryTitle}">${categoryTitle}</span>
                        </div>
                        <div class="combat-stats-grid">${currentCategoryHtml}</div>
                    </div>
                `;
            } else if (categoryKey === 'other_bonuses') {
                otherStatsHtml = `
                    <div class="combat-stats-category">
                        <div class="combat-stats-category-title">
                            <img src="${getCombatStatIconPath(categoryKey.replace('_bonuses', ''), "bonuses")}" alt="${categoryKey.replace('_bonuses', '')} icon" class="combat-category-icon">
                            <span title="${categoryTitle}">${categoryTitle}</span>
                        </div>
                        <div class="combat-stats-grid">${currentCategoryHtml}</div>
                    </div>
                `;
            }
        }
    }

    const releaseDateTimestamp = feedback.releaseDate.value;
    let releaseDateDisplay;
    if (releaseDateTimestamp && releaseDateTimestamp > 0) {
        const date = new Date(releaseDateTimestamp);
        const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
        releaseDateDisplay = date.toLocaleDateString(undefined, options);
    } else {
        releaseDateDisplay = 'N/A';
    }

    return `
        <div class="guess-content-wrapper">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <img src="${guess.image_local_path}" alt="${guess.title}" style="width: 50px; height: 50px; margin-right: 10px; object-fit: contain;">
                <div><span class="guess-category">Guess:</span> <a href="${feedback.item.url}" target="_blank" class="guess-value item-link ${feedback.item.status === 'correct' ? 'correct' : ''}">${feedback.item.value}</a></div>
            </div>
            ${(() => {
                let levelReqHtml = '';
                if (feedback.levelRequirement.details && Object.keys(feedback.levelRequirement.details).length > 0) {
                    levelReqHtml = `
                        <div class="level-requirements-container">
                            <div class="level-requirements-category">
                                <div class="level-requirements-category-title">Level Requirements</div>
                                <div class="level-requirements-grid">
                    `;
                    
                    for (const skill in feedback.levelRequirement.details) {
                        const skillValue = feedback.levelRequirement.details[skill].value;
                        const skillStatus = feedback.levelRequirement.details[skill].status;
                        const statusArrow = skillStatus === 'partial-high' ? ' &#9660;' : (skillStatus === 'partial-low' ? ' &#9650;' : '');
                        let skillDisplayStatus = skillStatus;
                        if (feedback.levelRequirement.details[skill].isCloseMatch && skillStatus !== 'correct') {
                            skillDisplayStatus += ' close-match';
                        }
                        const skillIconPath = getSkillIconPath(skill);
                        levelReqHtml += `
                            <div class="level-requirement-item">
                                <img src="${skillIconPath}" alt="${skill} icon" class="skill-icon">
                                <span class="level-requirement-value ${skillDisplayStatus}">${skillValue}${statusArrow}</span>
                            </div>
                        `;
                    }
                    levelReqHtml += `
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    // Fallback for "None" or if no specific skill requirements are present
                    let levelReqOverallStatus = feedback.levelRequirement.status;
                    if (feedback.levelRequirement.isCloseMatch && feedback.levelRequirement.status !== 'correct') {
                        levelReqOverallStatus += ' close-match';
                    }
                    levelReqHtml = `<div><span class="guess-category">Level Req:</span> <span class="guess-value ${levelReqOverallStatus}">${feedback.levelRequirement.value}</span></div>`;
                }
                return levelReqHtml;
            })()}
            <div><span class="guess-category">High Alch:</span> <span class="guess-value ${feedback.highAlch.status === 'correct' ? 'correct' : (feedback.highAlch.isCloseMatch ? feedback.highAlch.status + ' close-match' : feedback.highAlch.status)}">${feedback.highAlch.value} ${feedback.highAlch.status.includes('partial') ? (feedback.highAlch.status.includes('high') ? ' &#9660;' : ' &#9650;') : ''}</span></div>
            <div><span class="guess-category">Release Date:</span> <span class="guess-value ${feedback.releaseDate.status === 'correct' ? 'correct' : (feedback.releaseDate.isCloseMatch ? feedback.releaseDate.status + ' close-match' : feedback.releaseDate.status)}">${releaseDateDisplay} ${feedback.releaseDate.status.includes('partial') ? (feedback.releaseDate.status.includes('high') ? ' &#9660;' : ' &#9650;') : ''}</span></div>
            <div><span class="guess-category">Options:</span> <span class="guess-value ${feedback.options.status}">${feedback.options.value}</span></div>
            <div class="combat-stats-wrapper">
                ${attackStatsHtml}
                ${defenceStatsHtml}
                <div class="bottom-stats-row">
                    ${otherStatsHtml}
                </div>
            </div>
        </div>
        <div class="gear-slot-container top-right-slot ${feedback.gearSlot.status}">
            <img src="${getGearSlotIconPath(feedback.gearSlot.value)}" alt="${feedback.gearSlot.value} icon" class="gear-slot-icon">
        </div>
    `;
}

export function displayGuess(guess, feedback) {
    const listItem = document.createElement('li');
    listItem.style.position = 'relative';
    listItem.innerHTML = createGuessHTML(guess, feedback)
    guessList.prepend(listItem);
}