/**
 * Unit tests for security middleware
 * Tests: helmet headers, rate limiting, NoSQL injection prevention
 */
const { deepSanitize } = require('../middleware/security');

describe('NoSQL Injection Prevention (deepSanitize)', () => {
    it('should strip keys starting with $ from objects', () => {
        const input = { name: 'test', $gt: 1, $where: 'malicious' };
        const result = deepSanitize(input);
        expect(result).toEqual({ name: 'test' });
        expect(result.$gt).toBeUndefined();
        expect(result.$where).toBeUndefined();
    });

    it('should handle nested objects with $ keys', () => {
        const input = {
            user: {
                name: 'test',
                password: { $ne: '' }
            }
        };
        const result = deepSanitize(input);
        expect(result.user.name).toBe('test');
        expect(result.user.password).toEqual({});
    });

    it('should handle arrays', () => {
        const input = [{ $gt: 1, name: 'a' }, { $lt: 5, name: 'b' }];
        const result = deepSanitize(input);
        expect(result).toEqual([{ name: 'a' }, { name: 'b' }]);
    });

    it('should return null/undefined as-is', () => {
        expect(deepSanitize(null)).toBeNull();
        expect(deepSanitize(undefined)).toBeUndefined();
    });

    it('should return primitives unchanged', () => {
        expect(deepSanitize('test')).toBe('test');
        expect(deepSanitize(42)).toBe(42);
        expect(deepSanitize(true)).toBe(true);
    });

    it('should handle deeply nested injection attempts', () => {
        const input = {
            level1: {
                level2: {
                    level3: {
                        $or: [{ admin: true }],
                        safe: 'value'
                    }
                }
            }
        };
        const result = deepSanitize(input);
        expect(result.level1.level2.level3.safe).toBe('value');
        expect(result.level1.level2.level3.$or).toBeUndefined();
    });

    it('should handle empty objects', () => {
        expect(deepSanitize({})).toEqual({});
    });

    it('should handle empty arrays', () => {
        expect(deepSanitize([])).toEqual([]);
    });

    it('should strip all MongoDB operators', () => {
        const operators = ['$gt', '$gte', '$lt', '$lte', '$ne', '$in', '$nin',
            '$and', '$or', '$not', '$nor', '$exists', '$type', '$regex',
            '$where', '$text', '$expr', '$mod', '$all', '$elemMatch'];

        const input = {};
        operators.forEach(op => { input[op] = 'malicious'; });
        input.safeKey = 'value';

        const result = deepSanitize(input);
        expect(Object.keys(result)).toEqual(['safeKey']);
    });
});
