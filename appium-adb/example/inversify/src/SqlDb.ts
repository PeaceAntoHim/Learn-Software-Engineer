import Database from "better-sqlite3";
class SqlDb {
    db;
    async connectDb() {
        this.db = new Database("./db/remote_otp.db")
        this.db.pragma("journal_mode = WAL")
    }
}
let sqlDb = new SqlDb()
export  { sqlDb }
