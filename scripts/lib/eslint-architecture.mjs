import path from 'node:path';
import { fileURLToPath } from 'node:url';
import aliasConfig from '#project/config/module-aliases.js';

const sourceRoot = fileURLToPath(new URL('../../src/', import.meta.url));

const sourcePath = (filename) => {
  const relative = path.relative(sourceRoot, filename);
  const parts = relative.split(path.sep);

  return relative && parts[0] !== '..' && !path.isAbsolute(relative) ? parts : undefined;
};

export const architecture = {
  rules: {
    boundaries: {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          boundary:
            'Invalid dependency: {{from}} must not import {{to}}. Import a feature through its index.ts public API.',
        },
      },
      create: (context) => {
        const file = context.filename ?? context.getFilename();
        const from = sourcePath(file);
        if (!from) return {};

        const checkSource = (source) => {
          const name = source?.value;
          if (typeof name !== 'string') return;

          const target = name.startsWith('.')
            ? path.resolve(path.dirname(file), name)
            : aliasConfig.resolveAppAlias(name);
          const to = target && sourcePath(target);
          if (!to) return;

          const infrastructure = ['core', 'shared', 'modules'];
          const invalid =
            (infrastructure.includes(from[0]) && ['features', 'app'].includes(to[0])) ||
            (from[0] === 'features' && to[0] === 'app') ||
            (to[0] === 'features' &&
              (from[0] !== 'features' || from[1] !== to[1]) &&
              to.length > 2 &&
              to[2] !== 'index');

          if (invalid)
            context.report({
              node: source,
              messageId: 'boundary',
              data: { from: from.slice(0, 2).join('/'), to: to.join('/') },
            });
        };

        return {
          ImportDeclaration: (node) => checkSource(node.source),
          ExportNamedDeclaration: (node) => checkSource(node.source),
          ExportAllDeclaration: (node) => checkSource(node.source),
          ImportExpression: (node) => checkSource(node.source),
          CallExpression: (node) => {
            if (node.callee.type === 'Identifier' && node.callee.name === 'require')
              checkSource(node.arguments[0]);
          },
        };
      },
    },
  },
};
