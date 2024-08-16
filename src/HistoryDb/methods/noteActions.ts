import { Events, HistoryDb } from '..'
import { moment, TFile } from 'obsidian'

enum DateType {
  created = 'created',
  modified = 'created'
}

export async function trackNoteOpen (this: HistoryDb, file: TFile) {
  // Get the ID of the current note
  const res = this.db.exec('SELECT id FROM files WHERE path = ?', [file.path])
  let fileId = this.getSingleValue(res)

  if (!fileId) {
    // This is the first time we've seen this file - insert the new note data
    this.db.run('INSERT OR IGNORE INTO files (path, created, modified) VALUES (?, ?, ?)', [
      file.path,
      this.getNoteDate(file, DateType.created),
      this.getNoteDate(file, DateType.modified)
    ])
    fileId = this.getSingleValue(this.db.exec('SELECT last_insert_rowid();'))
  } else {
    // Update the modified date
    this.db.run('UPDATE files SET modified = ? WHERE id = ?', [this.getNoteDate(file, DateType.modified), fileId])
  }

  if (fileId) {
    // Log the history event
    this.db.run('INSERT INTO history (files_id, date, event) VALUES (?, ?, ?)', [fileId, this.now(), Events.openNote])
    await this.save()
  }
}

export function getNoteDate (this: HistoryDb, file: TFile, type: DateType, property?: string) {
  const fallback = type === DateType.created ? file.stat.ctime : file.stat.mtime
  const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter
  if (frontmatter?.[property || type]) {
    const test = moment(frontmatter[property || type], true)
    if (test.isValid()) {
      return this.dateToSqlite(test.valueOf())
    }
  }
  return this.dateToSqlite(fallback)
}
