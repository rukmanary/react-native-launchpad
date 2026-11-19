import { Database, Model, appSchema, tableSchema, Q } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { field } from '@nozbe/watermelondb/decorators';
import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';
import { synchronize } from '@nozbe/watermelondb/sync';
import { config } from '../../core/config/config';
export class Note extends Model {
  static table = 'notes';
  @field('title') title!: string;
  @field('updated_at') updatedAt!: number;
}
export function createDatabase(onSetupError: (error: Error) => void) {
  return new Database({
    adapter: new SQLiteAdapter({
      dbName: config.slug,
      schema: appSchema({
        version: 1,
        tables: [
          tableSchema({
            name: 'notes',
            columns: [
              { name: 'title', type: 'string' },
              { name: 'updated_at', type: 'number' },
            ],
          }),
        ],
      }),
      migrations: schemaMigrations({ migrations: [] }),
      jsi: true,
      onSetUpError: onSetupError,
    }),
    modelClasses: [Note],
  });
}
export async function addNote(db: Database, title: string) {
  const trimmed = title.trim();
  if (!trimmed) throw new Error('Title required');
  return db.write(() =>
    db.get<Note>('notes').create((note) => {
      note.title = trimmed;
      note.updatedAt = Date.now();
    }),
  );
}
export const observeNotes = (db: Database) =>
  db.get<Note>('notes').query(Q.sortBy('updated_at', Q.desc)).observe();
export async function deleteNote(note: Note) {
  await note.database.write(() => note.markAsDeleted());
}
export type SyncOptions = Parameters<typeof synchronize>[0];
const syncs = new WeakMap<Database, Promise<void>>();
export function syncDatabase(options: SyncOptions) {
  const existing = syncs.get(options.database);
  if (existing) return existing;
  const running = synchronize(options).finally(() => syncs.delete(options.database));
  syncs.set(options.database, running);
  return running;
}
