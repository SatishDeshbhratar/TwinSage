import { ComparisonData } from '../ts/types/comparison';

export const loadComparisonData = async (): Promise<ComparisonData[]> => {
  try {
    // Import the combined JSON file
    const module = await import(
      '../data/manual_json_files/error_cases_conservative.json'
    );

    if (
      typeof module === 'object' &&
      module !== null &&
      'default' in module &&
      Array.isArray(module.default)
    ) {
      console.log(
        `Loaded ${module.default.length} comparison records from combined JSON file`,
      );
      return module.default as ComparisonData[];
    }

    console.error('Invalid data format in combined JSON file');
    return [];
  } catch (error) {
    console.error('Error loading comparison data:', error);
    return [];
  }
};
