const Particle = require('./src/index');
if (window && !window.G2) {
  console.err('Please load the G2 script first!');
}

module.exports = Particle;
