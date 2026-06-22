import { CategoryDto } from '@/shared/types';

export function getCategoryName(category: Pick<CategoryDto, 'name' | 'nameRu'>, language: string): string {
  if (language === 'ru' && category.nameRu) return category.nameRu;
  return category.name;
}
