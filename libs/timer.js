module.exports = {
  start: function (fn, timeout) {
    this.timeoutObj = setTimeout(fn, timeout);
  },

  stop: function () {
    clearTimeout(this.timeoutObj);
  }
};