const Shape = require('./typhoon_shape');
const Routes = require('./typhoon_route');
const G = require('@antv/g');

const  SIZE = 50;
const DURATION = 300;

class Typhoon {
  constructor(cfg) {
    /* raw data for mapping*/
    this.id = cfg.id;
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
      id:self.id,
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
    //if landfall
    if(self.data.hasOwnProperty('landfall')){
      self._onLandfall();
    }
    self.canvas.draw();
  }

  hide() {
    const self = this;
    self.shape.hide();
    self.routes.hide();
  }

  clear() {
    this.canvas.clear();
    this.canvas.draw();
  }

  _onLandfall(){
    const self = this;
    const width = 20;
    const height = self._SpeedHeightMapping(self.data.maxSpeed);
    const color = self._SpeedColorMapping(self.data.maxSpeed);
    const initial_path = [
      ['M',self.position.x - width/2, self.position.y],
      ['L',self.position.x + width/2, self.position.y],
      ['L',self.position.x, self.position.y],
      ['Z']
    ];
    const path =  [
      ['M',self.position.x - width/2, self.position.y],
      ['L',self.position.x + width/2, self.position.y],
      ['L',self.position.x, self.position.y - height],
      ['Z']
    ];
    const mountain = self.canvas.addShape('path',{
      attrs:{
        path:initial_path,
        fill:'l(90) 0:rgba('+color+',1)'+' '+'1:rgba('+color+',0)',
        opacity:0,
        zIndex:10000
      }
    });
    //animate
    mountain.animate({
      path,
      opacity:1
    }, 1000, 'easeLinear');
  }

  //data mapping
  _SpeedHeightMapping(value){
    const max_speed = 50;
    const min_speed = 10;
    const max_size = 200;
    const min_size = 0;
    return min_size + (value - min_speed) / (max_speed - min_speed) * (max_size - min_size);
  }

  _SpeedColorMapping(value){
    const max_speed = 40;
    const min_speed = 10;
    const max_color = [228,24,136];
    const min_color = [31,179,236];
    const r = min_color[0] + (value - min_speed) / (max_speed - min_speed) * (max_color[0] - min_color[0]);
    const g = min_color[1] + (value - min_speed) / (max_speed - min_speed) * (max_color[1] - min_color[1]);
    const b = min_color[2] + (value - min_speed) / (max_speed - min_speed) * (max_color[2] - min_color[2]);
    return  r+','+g+','+b;
  }

}

module.exports = Typhoon;
