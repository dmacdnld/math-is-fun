"use strict";

global.chai = require("chai");
global.should = require("chai").should();
global.io = require('socket.io-client');
global.socketURL = 'http://localhost';
global.socketOptions ={
  transports: ['websocket'],
  'force new connection': true,
  port: 8002
};

var sinonChai = require("sinon-chai");
chai.use(sinonChai);