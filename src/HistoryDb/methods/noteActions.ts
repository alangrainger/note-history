import { Events, HistoryDb } from '..'
import { TFile } from 'obsidian'

export async function trackNoteOpen (this: HistoryDb, file: TFile) {
  // Get the ID of the current note
  const res = this.db.exec('SELECT id FROM files WHERE path = ?', [file.path])
  let fileId = this.getSingleValue(res)
  if (!fileId) {
    // This is the first time we've seen this file - insert the new note data
    this.db.run('INSERT OR IGNORE INTO files (path) VALUES (?)', [file.path])
    fileId = this.getSingleValue(this.db.exec("SELECT last_insert_rowid();"))
  }
  if (fileId) {
    // Log the history event
    console.log(fileId)
    this.db.run('INSERT INTO history (files_id, date, event) VALUES (?, ?, ?)', [fileId, this.now(), Events.openNote])
    await this.save()
  }
}
