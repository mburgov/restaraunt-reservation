import express from "express"
import path from 'path'
import dotenv from "dotenv"
import { Pool } from "pg"

// read environment variables
dotenv.config()

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`
// create an instance of the PostgreSQL client
const pool: Pool = new Pool({ connectionString })
const app = express()
const port = process.env.SERVER_PORT
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))
app.use(express.json())

app.get('/reservations', async (req, res) => {
    //make tables available if they have been booked for more than 1 minute
    updateExpiredReservations().then((freedTables) => {
        availableTables().then((result) => {
            const vacantTables = result.rowCount
            res.send({ vacantTables, freedTables })
        }).catch((err) => {
            res.status(404).send()
        });
    }).catch((err) => {
        res.status(404).send()
    });
})

app.get('/reservations/:user', async (req, res) => {
    //make tables available if they have been booked for more than 1 minute
    updateExpiredReservations().then(() => {
        availableTables().then(async (result) => {
            let vacantTables = result.rowCount
            const id = result.rows[0].id
            const user = req.params.user
            await pool.query(`UPDATE reservations SET username='${user}',available=false, booking_time=now() WHERE available=true AND id=${id}`)
                .then(() => {
                    vacantTables--
                    res.status(200).send({ user,vacantTables})
                })
        }).catch((err) => {
            res.status(404).send()
        });
    }).catch((err) => {
        res.status(404).send()
    })
})

const updateExpiredReservations = async () => {
    const result = await pool.query('UPDATE reservations SET available = true, booking_time = null, username = \'\' WHERE booking_time + interval \'1 minute\' < now()')
    return result.rowCount;
}

const availableTables = async () => {
    const result = await pool.query('SELECT id FROM reservations where available=true')
    return result;

}

app.listen(port, () => {
    console.log(`Server is listening on port: ${port}`);
})