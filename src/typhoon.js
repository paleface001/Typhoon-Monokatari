const Shape = require('./typhoon_shape');
const G = require('@antv/g');

const  SIZE = 50;

class Typhoon {
  constructor(cfg) {
    this.data = cfg.data;
    this.canvas = cfg.canvas;
    this.radius = cfg.radius;
    this.position = (cfg.position)?cfg.position:{x:0,y:0};
    this._init_();
  }

  _init_() {
    const self = this;
    self.shape = new Shape({
      data:dataSample,
      canvas:canvas,
      radius:SIZE,
      x:self.position.x,
      y:self.position.y
    });
    self.canvas.draw();
  }

  setData(data) {
    const self = this;
    self.data = data;
    self.shape.setData(data);
  }

  setPosition(x,y){
    const self = this;
    self.position.x = x;
    self.position.y = y;
  }

  update() {
    const self = this;
    self.shape.update();
    self.shape.moveTo(self.position.x,self.position.y);
    self.canvas.draw();
  }

  clear() {

  }

  destory() {

  }

  
}

module.exports = Typhoon;
