import { initDB } from "./seed.js";
import { closeConnection } from "./config/mongoConnection.js";
await initDB();
await closeConnection();