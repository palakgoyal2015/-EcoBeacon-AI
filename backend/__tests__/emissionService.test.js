const {
  calculateEmission,
  getEmissionFactors,
  getCategoryInfo,
} = require('../services/emissionService');

describe('emissionService', () => {
  test('calculates emission for valid type and category', () => {
    expect(calculateEmission('transportation', 'car', 10)).toBe(2.1);
    expect(calculateEmission('food', 'vegan', 2)).toBe(1.8);
  });

  test('rounds emission to 4 decimals', () => {
    expect(calculateEmission('transportation', 'motorcycle', 1)).toBe(0.103);
    expect(calculateEmission('transportation', 'motorcycle', 3)).toBe(0.309);
  });

  test('throws for unknown type', () => {
    expect(() => calculateEmission('unknown', 'car', 10)).toThrow('Unknown activity type: unknown');
  });

  test('throws for unknown category', () => {
    expect(() => calculateEmission('transportation', 'spaceship', 10)).toThrow(
      "Unknown category 'spaceship' for type 'transportation'"
    );
  });

  test('returns factors and category info', () => {
    const factors = getEmissionFactors();
    expect(factors.transportation.car.factor).toBe(0.21);

    expect(getCategoryInfo('shopping', 'secondhand')).toMatchObject({
      factor: 0.2,
      unit: 'item',
      label: 'Secondhand',
    });

    expect(getCategoryInfo('shopping', 'missing')).toBeNull();
  });
});
