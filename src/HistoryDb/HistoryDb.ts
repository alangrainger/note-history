import initSqlJs, { Database } from 'sql.js'
import MyPlugin from '../main'
import { App } from 'obsidian'
import * as methods from './methods'
import { SCHEMA } from './methods'

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

      Object.entries(SCHEMA).forEach(([table, tData]) => {

        // Create tables
        const columnSql = Object.entries(tData.columns)
          .map(([column, cData]) => `${column} ${cData.type}`)
          .join(', ')
        this.db.run('CREATE TABLE ' + table + ' (' + columnSql + ')')

        // Create indexes
        Object.entries(tData.columns)
          .forEach(([column, cData]) => {
            if (!cData.type.includes('PRIMARY KEY')) {
              // CREATE UNIQUE INDEX files_path ON files (path)
              this.db.run('CREATE ' + (cData.unique ? 'UNIQUE' : '') + ' INDEX ' + table + '_' + column + ' ON ' + table + ' (' + column + ')')
            }
          })
      })
      await this.save()
    }
  }
}

// Add methods
Object.entries(methods).forEach(([name, method]) => {
  // @ts-ignore
  HistoryDb.prototype[name] = method
})

// Add types
type Methods = typeof methods;
declare module './HistoryDb' {
  interface HistoryDb extends Methods {
  }
}
