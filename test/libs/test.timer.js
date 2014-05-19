var timer = require('../../libs/timer');

describe('timer',function () {
  var clock;
  var stub;

  beforeEach(function (done) {
    clock = sinon.useFakeTimers();
    stub = sinon.stub();
    done();
  });

  afterEach(function (done) {
    clock.restore();
    done();
  });

  describe('#start()', function () {

    it('should set timer#timeoutObj with the timeout object', function (done) {
      should.equal(timer.timeoutObj, undefined);

      timer.start(stub, 1);
      clock.tick(1);

      timer.timeoutObj.should.be.an.object;
      timer.timeoutObj.should.have.keys(['id', 'ref', 'unref']);
      done();
    });

    it('should execute callback after the delay', function (done) {
      stub.callCount.should.equal(0);

      timer.start(stub, 1);
      clock.tick(1);

      stub.should.have.been.calledOnce;
      done();
    });

  });

  describe('#stop', function () {

    it('should execute `global#clearTimeout` with timer#timeoutObj', function (done) {
      var spy = sinon.spy(global, 'clearTimeout');
      var timeoutObj = {};

      timer.timeoutObj = timeoutObj;
      timer.stop();

      spy.should.have.been.calledOnce;
      spy.should.have.been.calledWithExactly(timeoutObj);
      done();
    });

  });

});