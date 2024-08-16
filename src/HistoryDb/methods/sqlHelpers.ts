export function now () {
  return this.dateToSqlite(new Date())
}

export function dateToSqlite (date: Date | number) {
  if (typeof date === 'number') date = new Date(date)
  return date.toISOString().replace('T', ' ').slice(0, 19)
}
