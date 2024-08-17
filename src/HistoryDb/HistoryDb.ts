import initSqlJs, { BindParams, Database } from 'sql.js'
import MyPlugin from '../main'
import { App } from 'obsidian'
import * as methods from './methods'
import { SCHEMA } from './methods'

export enum Events {
  openNote,
  // createNote,
  // editNote
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

  /**
   * This is the function users will generally use to query the database.
   *
   * Since SQLite doesn't support stored procedures, we do a "text expansion" to
   * simplify things for the user.
   *
   * If a user queries 'FROM all_data', we expand that to include all tables with joins.
   */
  async query (sql: string, params?: BindParams) {
    const allTables: string = `
      FROM history
      INNER JOIN files ON files.id = history.files_id`
    sql = sql.replace(/\sFROM all_data\s/i, ` ${allTables} `)

    return this.db.exec(sql, params)
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
