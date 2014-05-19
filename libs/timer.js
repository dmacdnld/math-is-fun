module.exports = {
  start: function (fn, timeout) {
    this.timeoutId = setTimeout(fn, timeout);
  },

  stop: function () {
    clearTimeout(this.timeoutId);
  }
};