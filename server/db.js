// Using dynamic import for ESM modules
async function initializeDb() {
    const { Low } = await import('lowdb');
    const { JSONFile } = await import('lowdb/node');

    // Use /tmp for the database file in production (Cloud Run), otherwise use local file.
    // Cloud Run's file system is read-only except for /tmp.
    const dbPath = process.env.NODE_ENV === 'production' ? '/tmp/db.json' : 'db.json';
    const adapter = new JSONFile(dbPath);
    const db = new Low(adapter);
    
    // Read initial data and set defaults if the file is empty
    await db.read();
    db.data = db.data || { users: [], pantryItems: [] };
    await db.write();
    
    return db;
}

// Export a promise that resolves with the db instance
module.exports = { dbPromise: initializeDb() };