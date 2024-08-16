export function now () {
  return this.dateToSqlite(new Date())
}

export function dateToSqlite (date: Date) {
  return date.toISOString().replace('T', ' ').slice(0, 19)
}
