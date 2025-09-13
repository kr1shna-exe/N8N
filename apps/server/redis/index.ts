import { redis } from "../../../packages/exports";

await redis.connect();

export async function redisQueue() {
  try {
  } catch (error) {
    console.log("Error occured:", error);
  }
}
