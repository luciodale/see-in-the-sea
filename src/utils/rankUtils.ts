/**
 * Get Tailwind CSS color class based on ranking result
 * @param result - The ranking result ('first', 'second', 'third', or other)
 * @returns Tailwind CSS color class
 */
export function getRankColorClass(result: string): string {
  switch (result) {
    case 'first':
      return 'text-yellow-400'; // Gold
    case 'second':
      return 'text-gray-300'; // Silver
    case 'third':
      return 'text-amber-600'; // Bronze
    default:
      return 'text-gray-100'; // Default
  }
}
