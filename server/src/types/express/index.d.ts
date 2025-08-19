declare namespace Express {
  interface Request {
    logger: import('pino').Logger;
  }
}
