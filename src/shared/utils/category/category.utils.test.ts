import { getCategoryName } from './category.utils';

describe('getCategoryName', () => {
  it('returns the Russian name when language is "ru" and a Russian name exists', () => {
    const name = getCategoryName({ name: 'Food', nameRu: 'Еда' }, 'ru');
    expect(name).toBe('Еда');
  });

  it('falls back to the default name when language is "ru" but no Russian name exists', () => {
    const name = getCategoryName({ name: 'Food', nameRu: null }, 'ru');
    expect(name).toBe('Food');
  });

  it('returns the default name for any non-"ru" language', () => {
    const name = getCategoryName({ name: 'Food', nameRu: 'Еда' }, 'en');
    expect(name).toBe('Food');
  });
});
