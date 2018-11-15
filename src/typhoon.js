const G = require('@antv/g');

class Typhoon {
  constructor(cfg) {
    this.data = cfg.data;
    this.canvas = cfg.canvas;
    this.radius = cfg.radius;
    this._init_();
  }

  _init_() {
    const self = this;
    self.container = self.canvas.addGroup();
    const x = self.canvas.get('width') / 2;
    const y = self.canvas.get('height') / 2;
    self.container.translate(x, y);
  }

  draw() {
    const self = this;
    const center = { x: 0, y: 0 };
    const vertices = self._windDirVertex();
    //ne
    const ne_path = [
      ['M', center.x, center.y],
      ['L', vertices.e.x, vertices.ne.y],
      ['L', vertices.e.x, center.y],
      ['Z']
    ];
    self.container.addShape('path', {
      attrs: {
        path: ne_path,
        stroke: 'black',
        lineWidth: 2
      }
    });
    //se
    const se_path = [
      ['M', center.x, center.y],
      ['L', vertices.e.x, center.y],
      ['L', vertices.e.x, vertices.se.y],
      ['Z']
    ];
    self.container.addShape('path', {
      attrs: {
        path: se_path,
        stroke: 'black',
        lineWidth: 2
      }
    });
    //sw
    const sw_path = [
      ['M', center.x, center.y],
      ['L', vertices.w.x, center.y],
      ['L', vertices.w.x, vertices.sw.y],
      ['Z']
    ];
    self.container.addShape('path', {
      attrs: {
        path: sw_path,
        stroke: 'black',
        lineWidth: 2
      }
    });
    //nw
    const nw_path = [
      ['M', center.x, center.y],
      ['L', vertices.w.x, vertices.nw.y],
      ['L', vertices.w.x, center.y],
      ['Z']
    ];
    self.container.addShape('path', {
      attrs: {
        path: nw_path,
        stroke: 'black',
        lineWidth: 2
      }
    });

    //name
    self.container.addShape('circle',{
      attrs:{
        x:center.x,
        y:center.y - self.radius/5,
        r:10,
        fill:'black'
      }
    });

    self.canvas.draw();
  }

  update() {

  }

  clear() {

  }

  destory() {

  }

  //wind shape generate
  _windDirVertex() {
    const self = this;
    const startAngle = -90 * Math.PI / 180;
    const ne_angle = startAngle + 45 * Math.PI / 180;
    const nw_angle = startAngle + 315 * Math.PI / 180;
    const se_angle = startAngle + 135 * Math.PI / 180;
    const sw_angle = startAngle + 225 * Math.PI / 180;
    const ne = self._getVertexPosition(ne_angle,self.data.low_wind_ne);
    const nw = self._getVertexPosition(nw_angle,self.data.low_wind_nw);
    const se = self._getVertexPosition(se_angle,self.data.low_wind_se);
    const sw = self._getVertexPosition(sw_angle,self.data.low_wind_sw);    
    
    const c = { x: 0, y: 0 };
    const w = {x: -self.radius, y:0};
    const e = {x:self.radius, y:0};
    const n = {x:0,y:-self.radius};
    const s = {x:0,y:self.radius};

    return { ne, nw, se, sw, w,e,n,s,c };
  }


  _getVertexPosition(angle,d) {
    const self = this;
    const radius = self._getRaidus(d);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y };
  }

  //data mapping
  _getRaidus(d){
    const self = this;
    const max = 150;
    const min = 100;
    return (d - min) / (max-min) * self.radius;
  }


}

module.exports = Typhoon;
