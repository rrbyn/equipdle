export function getSkillIconPath(skillName) {
    return `icons/${skillName.charAt(0).toUpperCase() + skillName.slice(1)}_icon.png`;
}

export function getCombatStatIconPath(category, stat) {
    const statKey = `${category.toLowerCase()}_${stat}`;
    const iconMap = {
        'attack_stab': 'Stab_icon.webp',
        'attack_slash': 'Slash_icon.webp',
        'attack_crush': 'Crush_icon.webp',
        'attack_magic': 'Magic_icon.png',
        'attack_range': 'Ranged_icon.png',
        'defence_stab': 'Stab_icon.webp',
        'defence_slash': 'Slash_icon.webp',
        'defence_crush': 'Crush_icon.webp',
        'defence_magic': 'Magic_icon.png',
        'defence_range': 'Ranged_icon.png',
        'other_melee_strength': 'Strength_icon.png',
        'other_ranged_strength': 'Ranged_Strength_icon.webp',
        'other_magic_damage': 'Magic_Damage_icon.webp',
        'other_prayer': 'Prayer_icon.png',
        'attack_bonuses': 'Attack_icon.png',
        'defence_bonuses': 'Defence_icon.png',
        'other_bonuses': 'Melee_icon.webp'
    };
    return `icons/${iconMap[statKey] || 'default_icon.png'}`;
}

export function getGearSlotIconPath(slotName) {
    const iconMap = {
        '2h': '2h_slot.webp',
        'ammo': 'Ammo_slot.webp',
        'body': 'Body_slot.webp',
        'cape': 'Cape_slot.webp',
        'feet': 'Feet_slot.webp',
        'hands': 'Hands_slot.webp',
        'head': 'Head_slot.webp',
        'legs': 'Legs_slot.webp',
        'neck': 'Neck_slot.webp',
        'ring': 'Ring_slot.webp',
        'shield': 'Shield_slot.webp',
        'weapon': 'Weapon_slot.webp',
        'unknown': 'Unknown_slot.png'
    };
    return `icons/${iconMap[slotName.toLowerCase()] || 'default_slot_icon.webp'}`;
}