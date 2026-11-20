import path from 'node:path';

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
      create(context) {
        return {
          ImportDeclaration(node) {
            const name = node.source.value;
            if (typeof name !== 'string' || !name.startsWith('.')) return;

            const file = context.filename ?? context.getFilename();
            const source = file.split(path.sep + 'src' + path.sep)[1];
            if (!source) return;

            const target = path
              .resolve(path.dirname(file), name)
              .split(path.sep + 'src' + path.sep)[1];
            if (!target) return;

            const from = source.split(path.sep),
              to = target.split(path.sep);
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
                node,
                messageId: 'boundary',
                data: { from: from.slice(0, 2).join('/'), to: target },
              });
          },
        };
      },
    },
  },
};
