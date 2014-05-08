'use strict';

global.chai = require('chai');
global.should = chai.should();
global.sinon = require('sinon');

var sinonChai = require('sinon-chai');
chai.use(sinonChai);

global.sioc = require('socket.io-client');
global.socketURL = 'http://localhost';
global.socketOptions ={
  transports: ['websocket'],
  'force new connection': true,
  port: 5000
};


global._ = require('lodash');