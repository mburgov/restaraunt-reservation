"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const pg_1 = require("pg");
// read environment variables
dotenv_1.default.config();
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
// create an instance of the PostgreSQL client
const pool = new pg_1.Pool({ connectionString });
const app = express_1.default();
const port = process.env.SERVER_PORT;
const publicDirectoryPath = path_1.default.join(__dirname, '../public');
app.use(express_1.default.static(publicDirectoryPath));
app.use(express_1.default.json());
app.get('/reservations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //make tables available if they have been booked for more than 1 minute
    updateExpiredReservations().then((freedTables) => {
        availableTables().then((result) => {
            const vacantTables = result.rowCount;
            res.send({ vacantTables, freedTables });
        }).catch((err) => {
            res.status(404).send();
        });
    }).catch((err) => {
        res.status(404).send();
    });
}));
app.get('/reservations/:user', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //make tables available if they have been booked for more than 1 minute
    updateExpiredReservations().then(() => {
        availableTables().then((result) => __awaiter(void 0, void 0, void 0, function* () {
            let vacantTables = result.rowCount;
            const id = result.rows[0].id;
            const user = req.params.user;
            yield pool.query(`UPDATE reservations SET username='${user}',available=false, booking_time=now() WHERE available=true AND id=${id}`)
                .then(() => {
                vacantTables--;
                res.status(200).send({ user, vacantTables });
            });
        })).catch((err) => {
            res.status(404).send();
        });
    }).catch((err) => {
        res.status(404).send();
    });
}));
const updateExpiredReservations = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield pool.query('UPDATE reservations SET available = true, booking_time = null, username = \'\' WHERE booking_time + interval \'1 minute\' < now()');
    return result.rowCount;
});
const availableTables = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield pool.query('SELECT id FROM reservations where available=true');
    return result;
});
app.listen(port, () => {
    console.log(`Server is listening on port: ${port}`);
});
//# sourceMappingURL=app.js.map