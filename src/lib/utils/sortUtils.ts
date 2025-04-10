/**
     * Compara dos valores de objetos utilizando una ruta de propiedad potencialmente anidada
     * @param a Primer objeto a comparar
     * @param b Segundo objeto a comparar
     * @param key Cadena de ruta de propiedad, puede ser anidada (ej. "area.name")
     * @returns -1, 0, o 1 según la comparación
     */
export function compareValues<T, U>(
    a: T,
    b: U,
    key: string
): number {
    // Maneja propiedades anidadas (como "area.name")
    const keys = key.split('.');

    let valA: unknown = a;
    let valB: unknown = b;

    // Acceder a propiedades anidadas de manera segura
    for (const k of keys) {
        valA = typeof valA === 'object' && valA !== null ? (valA as Record<string, unknown>)[k] : undefined;
        valB = typeof valB === 'object' && valB !== null ? (valB as Record<string, unknown>)[k] : undefined;
    }

    // Si ambos valores son undefined o null, los consideramos iguales
    if (valA == null && valB == null) return 0;

    // Si solo valA es null/undefined, valB es mayor
    if (valA == null) return -1;

    // Si solo valB es null/undefined, valA es mayor
    if (valB == null) return 1;

    // Realizar comparación basada en tipos
    if (typeof valA === 'string' && typeof valB === 'string') {
        return valA.localeCompare(valB);
    }

    if (valA instanceof Date && valB instanceof Date) {
        return valA.getTime() - valB.getTime();
    }

    // Para números
    if (typeof valA === 'number' && typeof valB === 'number') {
        return valA - valB;
    }

    // Para booleanos
    if (typeof valA === 'boolean' && typeof valB === 'boolean') {
        return valA === valB ? 0 : (valA ? 1 : -1);
    }

    // Comparación general para otros tipos
    if (String(valA) === String(valB)) return 0;
    return String(valA) > String(valB) ? 1 : -1;
}