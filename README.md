# Note History plugin for Obsidian

## Mobile usage

**This plugin does not work on mobile.** Read on for a detailed explanation.

I wanted to use a proper database where the data could be indexed and persisted. The solution I ended up on ([sql.js](https://sql.js.org/)) works great on desktop and allows me to load the database to/from disk with Obsidian's native readBinary/writeBinary functions. Unfortunately it doesn't function on mobile due to the package trying to load 'fs' and 'path' even though we're not using them.

This isn't so much of a problem for me, as I do most of my heavy work in Obsidian desktop, so tracking my desktop usage is more important than my mobile usage.

Here are the other options I tried and the issues:

- [node-sqlite3](https://www.npmjs.com/package/sqlite3)
  - Doesn't load on desktop, with NodeJS.fs errors.
- [better-sqlite3](https://www.npmjs.com/package/better-sqlite3)
  - Same as above.
- [AlaSQL](https://github.com/AlaSQL/alasql)
  - Works, even on mobile, but you can only export the data to CSV and then import, which means  that it would have to rebuild the indexes on every load.
- [Dexie](https://dexie.org/)
  - This is a NoSQL wrapper for IndexedDB. It would work on mobile, but the syntax to make queries is not easy for the average person - especially things that are simple for SQL like `GROUP BY`. Since I wanted to expose the ability for anyone to query their own data (for example from a DataviewJS query), SQL is the better choice.

## FAQ

### Why don't you track moving/renaming of pages?

I chose to keep paths static in the database. When you move or rename a note, there will now be two entries in your history - the original path which no longer points to a note, and the new path.

Consider a vault set up like this:

```  
Projects  
\--My Job  
   \--Some Project\--Archive  
```

A great use for this plugin is finding out how much time you spend focused on various areas.

Imagine you're doing metrics based on the folders you spend a lot of time in. When you finish working on `Some Project`, if you moved it to the `Archive` folder, and the Note History plugin renamed that path in the database, suddenly it would look like you're spending all your time in the `Archive`, rather than where you're really spending your time, which is `My Job`.
