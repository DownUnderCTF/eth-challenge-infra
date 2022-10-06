export const PORT = Number(process.env.PORT) || 3000;
export const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');

export const BLOCKCHAIN_URL = process.env.BLOCKCHAIN_URL || "http://localhost:8545";