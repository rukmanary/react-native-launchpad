export function selectModules(catalog, selection) {
  const names = selection.split(',').map((name) => name.trim());
  if (names.length === 1 && names[0] === 'all') {
    names.splice(0, 1, ...Object.keys(catalog.groups).filter((name) => name !== 'zustand'));
  }
  for (const name of names) {
    if (name === 'zustand') throw new Error('Use --state zustand to select Zustand.');
    if (!Object.hasOwn(catalog.groups, name))
      throw new Error(
        `Unknown module "${name}". See config/dependencies.json for available modules.`,
      );
  }
  return [...new Set(['core', ...names])];
}
