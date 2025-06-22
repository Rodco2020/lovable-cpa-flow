
/**
 * Data Filter for Performance Module
 */

export class DataFilter {
  static filter<T>(items: T[], predicate: (item: T) => boolean): T[] {
    return items.filter(predicate);
  }

  static async filterAsync<T>(
    items: T[], 
    predicate: (item: T) => Promise<boolean>
  ): Promise<T[]> {
    const results = await Promise.all(
      items.map(async item => ({ item, passes: await predicate(item) }))
    );
    return results.filter(result => result.passes).map(result => result.item);
  }
}
