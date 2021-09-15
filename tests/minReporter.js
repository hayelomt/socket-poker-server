const mocha = require('mocha');
const inherits = require('util').inherits;

function Reporter(runner) {
  mocha.reporters.Spec.call(this, runner);

  runner.on('start', function () {
    // clear screen
    process.stdout.write('\033[2J');
    // move cursor to the top
    process.stdout.write('\u001b[1;3H');
    // console.clear();
  });
}

inherits(Reporter, mocha.reporters.Spec);

module.exports = Reporter;
