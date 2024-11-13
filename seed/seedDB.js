import { initDB, seedDB } from "./seed.js";
import { closeConnection } from "../config/mongoConnection.js";
await initDB();
await seedDB();
await closeConnection();
