export interface Schema {
  [tableName: string]: {
    [columnName: string]: {
      [columnData: string]: {
        type: string;
        unique?: boolean
      }
    }
  }
}

export const SCHEMA: Schema = {
  files: {
    columns: {
      id: {
        type: 'INTEGER PRIMARY KEY'
      },
      path: {
        type: 'TEXT NOT NULL',
        unique: true
      },
      created: {
        type: 'TEXT NOT NULL'
      },
      modified: {
        type: 'TEXT NOT NULL'
      }
    }
  },
  history: {
    columns: {
      id: {
        type: 'INTEGER PRIMARY KEY'
      },
      files_id: {
        type: 'INTEGER NOT NULL'
      },
      date: {
        type: 'TEXT NOT NULL'
      },
      event: {
        type: 'INTEGER NOT NULL'
      }
    }
  }
}
