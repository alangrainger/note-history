import { Plugin } from 'obsidian'
import { DEFAULT_SETTINGS, MyPluginSettings } from './settings'
import { HistoryDb } from './HistoryDb'

export default class MyPlugin extends Plugin {
  settings: MyPluginSettings
  history: HistoryDb

  async onload () {
    await this.loadSettings()

    this.history = new HistoryDb(this)
    await this.history.initDatabase()

    this.registerEvent(this.app.workspace.on('file-open', (file) => {
      if (file) {
        this.history.trackNoteOpen(file)
      }
    }))
  }

  async loadSettings () {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  /* async saveSettings () {
    await this.saveData(this.settings)
  } */
}
