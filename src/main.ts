import { Plugin } from 'obsidian'
import { DEFAULT_SETTINGS, MyPluginSettings, MySettingTab } from './settings'

export default class MyPlugin extends Plugin {
  settings: MyPluginSettings

  async onload () {
    await this.loadSettings()

    const initSqlJs = require('sql.js');
// or if you are in a browser:
// const initSqlJs = window.initSqlJs;

    const SQL = await initSqlJs({
      // Required to load the wasm binary asynchronously. Of course, you can host it wherever you want
      // You can omit locateFile completely when running in node
      locateFile: file => `sql-wasm.wasm`
    });
    const db = new SQL.Database();
    let sqlstr = "CREATE TABLE hello (a int, b char); \
INSERT INTO hello VALUES (0, 'hello'); \
INSERT INTO hello VALUES (1, 'world');";
    db.run(sqlstr); // Run the query without returning anything



    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new MySettingTab(this.app, this))
  }

  async loadSettings () {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings () {
    await this.saveData(this.settings)
  }
}
