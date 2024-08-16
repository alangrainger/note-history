import { HistoryDb } from '..'

const thisPluginId = require('../../../manifest.json').id

/**
 * Write the in-memory database to disk
 */
export async function save (this: HistoryDb) {
  const data = this.db.export().buffer
  await this.app.vault.adapter.writeBinary(this.pluginFile('history.db'), data)
}

export function pluginFile (this: HistoryDb, filename: string, absolute = false) {
  const path = [
    this.app.vault.configDir,
    'plugins',
    thisPluginId,
    filename
  ]
  if (absolute) path.unshift(this.app.vault.adapter.basePath)
  return path.join('/')
}
