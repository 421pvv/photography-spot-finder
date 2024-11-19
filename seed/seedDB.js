import { initDB, seedDB } from "./seed.js";
import { closeConnection } from "../config/mongoConnection.js";
import importDB from "./importDB.js";
await initDB();
await importDB();
await closeConnection();
