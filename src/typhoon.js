const Shape = require('./typhoon_shape');
const G = require('@antv/g');

const  SIZE = 200;

class Typhoon {
  constructor(cfg) {
    this.data = cfg.data;
    this.canvas = cfg.canvas;
    this.radius = cfg.radius;
    this._init_();
  }

  _init_() {
    const self = this;
    self.shape = new Shape({
      data:dataSample,
      canvas:canvas,
      radius:SIZE
    });
    self.canvas.draw();
  }

  setData(data) {
    const self = this;
    self.data = data;
    self.shape.setData(data);
  }

  update() {
    const self = this;
    self.shape.update();
    
  }

  clear() {

  }

  destory() {

  }

  
}

module.exports = Typhoon;
