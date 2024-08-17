import { QueryExecResult } from 'sql.js'

/**
 * Returns the value of the first column in the first row for a given sql.js result
 */
export function getSingleValue (result: QueryExecResult[]) {
  return result?.[0]?.values?.[0]?.[0]
}
