import cron from "node-cron";
import { autoReleaseEscrow } from "../services/escrowService.js";

cron.schedule("0 * * * *", async () => {
  console.log("⏱ Running escrow release check...");
  await autoReleaseEscrow();
});
