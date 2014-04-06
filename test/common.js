"use strict";

global.app = require('../app.js');
global.server = require ('../server.js')(app);
global.chai = require("chai");
global.should = require("chai").should();
global.io = require('socket.io-client');
global.socketURL = 'http://localhost';
global.socketOptions ={
  transports: ['websocket'],
  'force new connection': true,
  port: 8002
};