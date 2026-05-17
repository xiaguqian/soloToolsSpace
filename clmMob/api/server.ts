
import app from './app.js';
import { initDatabase } from './config/db.js';

const PORT = 8011;

async function startServer() {
  await initDatabase();
  
  const server = app.listen(PORT, () => {
    console.log(`Server ready on port ${PORT}`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT signal received');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

startServer();

export default app;
