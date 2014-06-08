global.chai = require('chai');
global.should = chai.should();
global.sinon = require('sinon');

var sinonChai = require('sinon-chai');
chai.use(sinonChai);

global._ = require('lodash');

global.gameConfig = require('../libs/game-config');