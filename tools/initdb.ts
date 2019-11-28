import dotenv from "dotenv";
import fs from "fs-extra";
import { Client } from "pg";

// read environment variables
dotenv.config()
const connectionString: string = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`

const init = async () => {

    // create an instance of the PostgreSQL client
    const client: Client = new Client(connectionString)

    try {
        // connect to the local database server
        await client.connect()
        // read the contents of the initdb.pgsql file
        const sql: string = await fs.readFile("./tools/initdb.pgsql", { encoding: "UTF-8" });
        // split the file into separate statements
        const statements: string[] = sql.split(/;\s*$/m)
        for (const statement of statements) {
            if (statement.length > 3) {
                // execute each of the statements
                await client.query(statement);
            }
        }
    } catch (err) {
        throw new Error(err);
    } finally {
        // close the database client
        await client.end();
    }
};

init().then(() => {
    console.log("Finished initializing the db");
}).catch(() => {
    console.log("Error while initializing the db");
});