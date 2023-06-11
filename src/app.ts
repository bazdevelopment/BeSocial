// import { initializeServer } from 'server';

function start(): void {
  // initializeServer();
  handleExit();
}

function handleExit(): void {
  process.on('uncaughtException', (error: Error) => {
    console.error(`There was an uncaught error: ${error}`);
    shutDownProperly(1);
  });

  process.on('unhandleRejection', (reason: Error) => {
    console.error(`Unhandled rejection at promise: ${reason}`);
    shutDownProperly(2);
  });

  process.on('SIGTERM', () => {
    console.error('Caught SIGTERM');
    shutDownProperly(2);
  });

  process.on('SIGINT', () => {
    console.error('Caught SIGINT');
    shutDownProperly(2);
  });

  process.on('exit', () => {
    console.error('Exiting');
  });
}

function shutDownProperly(exitCode: number): void {
  Promise.resolve()
    .then(() => {
      console.info('Shutdown complete');
      process.exit(exitCode);
    })
    .catch((error) => {
      console.error(`Error during shutdown: ${error}`);
      process.exit(1);
    });
}

start();
