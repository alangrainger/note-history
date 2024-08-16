import initSqlJs, { Database } from 'sql.js'
import MyPlugin from '../main'
import { App } from 'obsidian'
import * as methods from './methods';

export enum Events {
  openNote,
  createNote,
  editNote
}

export class HistoryDb {
  plugin: MyPlugin
  app: App
  db: Database

  constructor (plugin: MyPlugin) {
    this.plugin = plugin
    this.app = plugin.app
  }

  async initDatabase () {
    const SQL = await initSqlJs({
      locateFile: _file => this.pluginFile('sql-wasm.wasm', true)
    })

    try {
      // Attempt to load existing database from disk
      const db = await this.app.vault.adapter.readBinary(this.pluginFile('history.db'))
      this.db = new SQL.Database(Buffer.from(db))
    } catch (e) {
      // No existing DB found, create a new one
      this.db = new SQL.Database()
      // Create tables
      this.db.run('CREATE TABLE files (id INTEGER PRIMARY KEY, path TEXT UNIQUE NOT NULL)')
      this.db.run('CREATE TABLE history (id INTEGER PRIMARY KEY, files_id INTEGER NOT NULL, date TEXT NOT NULL, event INTEGER NOT NULL)')
      // Indexes
      this.db.run('CREATE UNIQUE INDEX files_path ON files (path);')
      this.db.run('CREATE INDEX history_files_id ON history (files_id);')
      this.db.run('CREATE INDEX history_date ON history (date);')
      this.db.run('CREATE INDEX history_event ON history (event);')
      await this.save()
    }
  }
}

// Add methods
Object.entries(methods).forEach(([name, method]) => {
  // @ts-ignore
  HistoryDb.prototype[name] = method;
});

// Add types
type Methods = typeof methods;
declare module './HistoryDb' {
  interface HistoryDb extends Methods { }
}
