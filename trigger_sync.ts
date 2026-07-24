import "dotenv/config";
import { runSyncWorker } from "./src/server/syncWorker";

console.log("Triggering explicit sync worker run...");
runSyncWorker().then(() => {
    console.log("Sync worker finished cycle.");
}).catch(e => {
    console.error(e);
});
