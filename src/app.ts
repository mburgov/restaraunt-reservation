import express from "express"
import path from 'path'
import dotenv from "dotenv"
import { Pool, QueryResult } from "pg"

// read environment variables
dotenv.config()

const connectionString: string = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`
// create an instance of the PostgreSQL client
const pool: Pool = new Pool({ connectionString })
const app = express()
const port: string = process.env.SERVER_PORT
const publicDirectoryPath: string = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))
app.use(express.json())

app.get('/reservations', async (req, res) => {
    let result: QueryResult, freedTables: number
    try {
        //make tables available if they have been booked for more than 1 minute
        freedTables = await updateExpiredReservations()
        result = await availableTables()

    } catch (error) {
        res.status(404).send()
    }
    const vacantTables: number = result.rowCount
    res.send({ vacantTables, freedTables })
})

app.post('/reservations/:user', async (req, res) => {
    let result: QueryResult
    try {
        //make tables available if they have been booked for more than 1 minute
        await updateExpiredReservations()
        result = await availableTables()

        let vacantTables: number = result.rowCount
        const id: number = result.rows[0].id
        const user: string = req.params.user

        await pool.query(`UPDATE reservations SET username='${user}',available=false, booking_time=now() WHERE available=true AND id=${id}`)
        vacantTables--
        res.status(200).send({ user, vacantTables })
    } catch (error) {
        res.status(404).send()
    }
})

const updateExpiredReservations = async () => {
    const result:QueryResult = await pool.query('UPDATE reservations SET available = true, booking_time = null, username = \'\' WHERE booking_time + interval \'1 minute\' < now()')
    return result.rowCount;
}

const availableTables = async () => {
    const result: QueryResult = await pool.query('SELECT id FROM reservations where available=true')
    return result;  

}

app.listen(port, () => {
    console.log(`Server is listening on port: ${port}`);
})