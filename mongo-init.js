db = connect(`mongodb://localhost/${process.env.MONGO_INITDB_DATABASE}`);

db.createUser(
    {
        user: process.env.MONGO_INITDB_ROOT_USERNAME,
        pwd: process.env.MONGO_INITDB_ROOT_PASSWORD,
        roles: [
            {
                role: "readWrite",
                db: process.env.MONGO_INITDB_DATABASE
            }
        ]
    }
);

db.createCollection("goals")
db.createCollection("profiles")
db.createCollection("weight_entries")
db.createCollection("visitors")
db.createCollection("spotify_sync_tokens")
db.createCollection("spotify_plays")
db.createCollection("spotify_snapshots")
db.createCollection("spotify_sync_meta")