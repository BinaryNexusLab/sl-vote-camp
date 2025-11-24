// Generate unique IDs for new entities
export function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generatePersonId() {
    return generateId('person');
}

export function generateUnionId() {
    return generateId('union');
}

export function generateWardId() {
    return generateId('ward');
}

export function generateRegionId() {
    return generateId('region');
}