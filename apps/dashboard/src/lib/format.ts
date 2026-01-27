/**
 * Format a category label from Kubernetes format to human-readable format
 * Examples:
 *   "data-collection" -> "Data Collection"
 *   "data-enrichment" -> "Data Enrichment"
 *   "reporting" -> "Reporting"
 */
export function formatCategory(category: string): string {
  if (!category || category === 'uncategorized') return 'Uncategorized';

  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Convert category to Kubernetes-safe label format
 * Examples:
 *   "Data Collection" -> "data-collection"
 *   "Data Enrichment" -> "data-enrichment"
 */
export function toCategoryLabel(category: string): string {
  return category.replace(/\s+/g, '-').toLowerCase();
}
