## Notes on mobile usage

**This plugin does not work on mobile.** Read on for a detailed explanation.

I wanted to use a proper database where the data could be indexed and persisted.
The solution I ended up on ([sql.js](https://sql.js.org/)) works great on desktop
and allows me to load the database to/from disk with Obsidian's native readBinary/writeBinary
functions. Unfortunately it doesn't function on mobile due to the package trying to 
load 'fs' and 'path' even though we're not using them.

This isn't so much of a problem for me, as I do most of my heavy work in Obsidian desktop,
so tracking my desktop usage is more important than my mobile usage.

Here are the other options I tried and the issues:

- [node-sqlite3](https://www.npmjs.com/package/sqlite3)
  - Doesn't load on desktop, with NodeJS.fs errors.
- [better-sqlite3](https://www.npmjs.com/package/better-sqlite3)
  - Same as above
- [AlaSQL](https://github.com/AlaSQL/alasql)
  - Works, even on mobile, but you can only export the data to CSV and then import, which means
    that it would have to rebuild the indexes on every load.

