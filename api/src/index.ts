import { HOST, PORT } from "./config";
import { init } from "./server";
import dotenv from "dotenv";
dotenv.config();



const start = async () => {
  const server = await init();
  
  try {
    await server.listen({port: PORT, host: HOST});
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();