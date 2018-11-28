const Shape = require('./typhoon_shape');
const Routes = require('./typhoon_route');
const G = require('@antv/g');

const  SIZE = 50;
const DURATION = 1000;

class Typhoon {
  constructor(cfg) {
    /* raw data for mapping*/
    this.data = cfg.data; 
    this.prevData = null;
    this.canvas = cfg.canvas;
    this.radius = cfg.radius;
    this.position = (cfg.position)?cfg.position:{x:0,y:0};
    this.prevPosition = {x:null,y:null};
    this._init_();
  }

  _init_() {
    const self = this;
    self.routes = new Routes({
      canvas:self.canvas,
      duartion:DURATION
    });

    self.shape = new Shape({
      data:self.data,
      canvas:self.canvas,
      radius:SIZE,
      x:self.position.x,
      y:self.position.y,
      duartion:DURATION
    });

    self.canvas.draw();
  }

  setData(data) {
    const self = this;
    self.prevData = self.data;
    self.data = data;
    self.shape.setData(data);
  }

  setPosition(x,y){
    const self = this;
    self.prevPosition.x = self.position.x;
    self.prevPosition.y = self.position.y;
    self.position.x = x;
    self.position.y = y;
  }

  update() {
    const self = this;
    self.shape.update();
    self.shape.moveTo(self.position.x,self.position.y);
    if(self.prevPosition.x && self.prevPosition.y){
      const routeData = {start:{x:self.prevPosition.x,y:self.prevPosition.y},
                         end:{x:self.position.x,y:self.position.y}
                        };
      self.routes.addPath(routeData,self.data, self.prevData);
    }
    self.canvas.draw();
  }

  clear() {

  }

  destory() {

  }

}

module.exports = Typhoon;
