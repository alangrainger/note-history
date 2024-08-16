import { Plugin } from 'obsidian'
import { DEFAULT_SETTINGS, MyPluginSettings } from './settings'
import initSqlJs, { Database } from 'sql.js'

const thisPluginId = require('../manifest.json').id

enum Events {
  openNote
}

export default class MyPlugin extends Plugin {
  settings: MyPluginSettings
  db: Database

  async onload () {
    await this.loadSettings()
    await this.initDatabase()

    this.registerEvent(this.app.workspace.on('file-open', (file) => {
      if (file) {
        // Get the ID of the current note
        this.db.run('INSERT OR IGNORE INTO files (path) VALUES (?)', [file.path])
        const res = this.db.exec('SELECT id FROM files WHERE path = ?', [file.path])
        const fileId = res[0].values[0][0]
        // Log the history event
        this.db.run('INSERT INTO history (files_id, date, event) VALUES (?, ?, ?)', [fileId, this.now(), Events.openNote])
        this.writeDb()
      }
    }))
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
      await this.writeDb()
    }
  }

  async writeDb () {
    const data = this.db.export().buffer
    await this.app.vault.adapter.writeBinary(this.pluginFile('history.db'), data)
  }

  pluginFile (filename: string, absolute = false) {
    const path = [
      this.app.vault.configDir,
      'plugins',
      thisPluginId,
      filename
    ]
    if (absolute) path.unshift(this.app.vault.adapter.basePath)
    return path.join('/')
  }

  now () {
    return this.dateToSqlite(new Date())
  }

  dateToSqlite (date: Date) {
    return date.toISOString().replace('T', ' ').slice(0, 19)
  }

  async loadSettings () {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings () {
    await this.saveData(this.settings)
  }
}
