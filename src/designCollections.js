export function groupDesigns(designs = []) {
  const groups = [];
  const collectionIndexes = new Map();

  designs.forEach((design) => {
    const collectionKey = design.collectionKey?.trim();

    if (!collectionKey) {
      groups.push({
        key: `single:${design.slug}`,
        slug: design.slug,
        title: design.title,
        category: design.category,
        description: design.description,
        isCollection: false,
        isFeatured: design.isFeatured,
        items: [design],
      });
      return;
    }

    const mapKey = `collection:${collectionKey}`;
    const existingIndex = collectionIndexes.get(mapKey);
    if (existingIndex !== undefined) {
      const group = groups[existingIndex];
      group.items.push(design);
      group.isFeatured ||= design.isFeatured;
      return;
    }

    collectionIndexes.set(mapKey, groups.length);
    groups.push({
      key: mapKey,
      slug: collectionKey,
      title: design.collectionTitle?.trim() || design.category || design.title,
      category: design.category,
      description: design.description,
      isCollection: true,
      isFeatured: design.isFeatured,
      items: [design],
    });
  });

  return groups;
}
