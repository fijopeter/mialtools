/**
 * Flatten the meter catalog to get all final meter options (those with meterSchema)
 * @param {Array} catalog - The meterCatalog array
 * @returns {Array} Array of final meter options with full path information
 */
export function flattenCatalog(catalog) {
  const finalOptions = [];

  function traverseOptions(options, categoryId, categoryLabel, path = [], idPath = []) {
    options.forEach((option) => {
      const currentPath = [...path, option.label];
      const currentIdPath = [...idPath, option.id];

      // If this is a final option (has meterSchema and no subOptions)
      if (option.meterSchema && !option.subOptions) {
        finalOptions.push({
          id: option.id,
          code: option.code,
          label: option.label,
          description: option.description,
          categoryId,
          categoryLabel,
          fullPath: currentPath.join(' → '),
          navigationPath: currentIdPath, // Array of IDs to navigate to this option
          meterSchema: option.meterSchema,
          tagSchema: option.tagSchema,
          certificateConfig: option.certificateConfig,
          tagDrawConfig: option.tagDrawConfig,
        });
      } else if (option.subOptions) {
        // Traverse sub-options
        traverseOptions(option.subOptions, categoryId, categoryLabel, currentPath, currentIdPath);
      }
    });
  }

  catalog.forEach((category) => {
    traverseOptions(category.options, category.id, category.label);
  });

  return finalOptions;
}
