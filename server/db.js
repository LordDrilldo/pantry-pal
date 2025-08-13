const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

// Configure lowdb to use a JSON file for storage
const adapter = new JSONFile('db.json');
const db = new Low(adapter);

// Set default data if the file is empty
const setDefaultData = async () => {
    db.data = db.data || { users: [], pantryItems: [] };
    await db.write();
};

setDefaultData();

module.exports = { db };