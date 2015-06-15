import { createServer } from 'http';

import express from 'express';
import sio from 'socket.io';

import routes from './app/server/routes';
import Events from './app/server/lib/events';

const app = express();
const server = createServer(app);
const io = sio(server);
const port = process.env.PORT || 5001;

// set up routes
routes(app);

// set up event handling
Events.init(io);

// start the server
server.listen(port, () => {
  console.log(`listening on *:${ port }`);
});
