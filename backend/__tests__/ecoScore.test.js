const {
  calculateEcoScore,
  getScoreLabel,
  getBadges,
  updateStreak,
} = require('../utils/ecoScore');

describe('ecoScore utils', () => {
  test('returns default score when no activities', () => {
    expect(calculateEcoScore([])).toBe(50);
    expect(calculateEcoScore(null)).toBe(50);
  });

  test('calculates higher score for eco-friendly activities', () => {
    const activities = [
      { emission: 0, type: 'transportation', category: 'walking', date: '2026-05-01' },
      { emission: 0.1, type: 'transportation', category: 'bike', date: '2026-05-01' },
      { emission: 1.2, type: 'food', category: 'vegan', date: '2026-05-02' },
      { emission: 0.3, type: 'shopping', category: 'secondhand', date: '2026-05-03' },
    ];

    const score = calculateEcoScore(activities);
    expect(score).toBeGreaterThanOrEqual(90);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('calculates lower score for high emissions', () => {
    const activities = [
      { emission: 20, type: 'transportation', category: 'car', date: '2026-05-01' },
      { emission: 18, type: 'food', category: 'beef', date: '2026-05-02' },
      { emission: 22, type: 'shopping', category: 'high-impact', date: '2026-05-03' },
    ];

    const score = calculateEcoScore(activities);
    expect(score).toBeLessThan(50);
  });

  test('maps score label buckets correctly', () => {
    expect(getScoreLabel(85).label).toBe('Excellent');
    expect(getScoreLabel(60).label).toBe('Moderate');
    expect(getScoreLabel(20).label).toBe('Needs Improvement');
  });

  test('returns expected badges for milestones', () => {
    const badges = getBadges(90, 7, 50).map((b) => b.id);
    expect(badges).toEqual(
      expect.arrayContaining([
        'getting_started',
        'active_tracker',
        'dedicated',
        'eco_aware',
        'eco_warrior',
        'green_hero',
        'streak_3',
        'week_streak',
      ])
    );
  });

  test('updateStreak handles first log, same day, consecutive day and reset', () => {
    const first = updateStreak({ streak: 0, lastLogDate: null });
    expect(first.streak).toBe(1);

    const today = new Date();
    const sameDay = updateStreak({ streak: 3, lastLogDate: today });
    expect(sameDay.streak).toBe(3);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const consecutive = updateStreak({ streak: 3, lastLogDate: yesterday });
    expect(consecutive.streak).toBe(4);

    const old = new Date();
    old.setDate(old.getDate() - 5);
    const reset = updateStreak({ streak: 10, lastLogDate: old });
    expect(reset.streak).toBe(1);
  });
});
