const path = require('node:path');
const { compilerOptions } = require('#project/tsconfig.json');

const projectRoot = path.resolve(__dirname, '..');
const escapePattern = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const aliases = Object.entries(compilerOptions.paths)
  .sort(([left], [right]) => right.length - left.length)
  .map(([alias, [target]]) => {
    const wildcard = alias.endsWith('*');
    const prefix = wildcard ? alias.slice(0, -1) : alias;

    return {
      pattern: new RegExp(`^${escapePattern(prefix)}${wildcard ? '(.*)' : ''}$`),
      target: wildcard ? target.slice(0, -1) + '$1' : target,
    };
  });

const resolveAppAlias = (name) => {
  const alias = aliases.find(({ pattern }) => pattern.test(name));

  return alias && path.resolve(projectRoot, name.replace(alias.pattern, alias.target));
};

const moduleNameMapper = Object.fromEntries(
  aliases.map(({ pattern, target }) => [pattern.source, '<rootDir>/' + target.slice(2)]),
);

module.exports = { moduleNameMapper, resolveAppAlias };
