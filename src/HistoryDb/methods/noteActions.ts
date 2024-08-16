import { Events, HistoryDb } from '..'
import { moment, TFile } from 'obsidian'

export async function trackNoteOpen (this: HistoryDb, file: TFile) {
  // Get the ID of the current note
  const res = this.db.exec('SELECT id FROM files WHERE path = ?', [file.path])
  let fileId = this.getSingleValue(res)

  // Get frontmatter
  const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter
  let created = file.stat.ctime
  let modified = file.stat.mtime
  if (frontmatter?.created) {
    const test = moment(frontmatter.created, true)
    if (test.isValid()) created = test.valueOf()
  }
  if (frontmatter?.modified) {
    const test = moment(frontmatter.modified, true)
    if (test.isValid()) modified = test.valueOf()
  }

  if (!fileId) {
    // This is the first time we've seen this file - insert the new note data
    this.db.run('INSERT OR IGNORE INTO files (path, created, modified) VALUES (?, ?, ?)', [
      file.path, this.dateToSqlite(created), this.dateToSqlite(modified)
    ])
    fileId = this.getSingleValue(this.db.exec('SELECT last_insert_rowid();'))
  } else {
    // Update the modified date
    this.db.run('UPDATE files SET modified = ? WHERE id = ?', [this.dateToSqlite(modified), fileId])
  }

  if (fileId) {
    // Log the history event
    this.db.run('INSERT INTO history (files_id, date, event) VALUES (?, ?, ?)', [fileId, this.now(), Events.openNote])
    await this.save()
  }
}
