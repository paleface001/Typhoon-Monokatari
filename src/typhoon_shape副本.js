const G = require('@antv/g');

const DIRS = ['ne', 'se', 'sw', 'nw'];
const LEVELS = ['low', 'mode', 'high'];
const COLORS = { 'low': '#e56524', 'mode': '#ed2236', 'high': '#881678' };

class TyphoonShape {
  constructor(cfg) {
    this.data = cfg.data;
    this.canvas = cfg.canvas;
    this.radius = cfg.radius;
    this.x = cfg.x;
    this.y = cfg.y;
    this.duartion = cfg.duartion;
    this._init_();
  }

  _init_() {
    const self = this;
    self.container = self.canvas.addGroup();
    self.container.translate(self.x, self.y);
    self._initializeShape();
  }

  setData(data) {
    const self = this;
    self.data = data;
  }

  moveTo(x,y){
    const self = this;
    //heading
    const dx = x - self.x;
    const dy = y - self.y;
    const angle = Math.atan(dy/dx) + Math.PI/2;
    const mat = self.container.attr('matrix');
    mat[0] = Math.cos(angle);
    mat[1] = Math.sin(angle);
    mat[3] = -Math.sin(angle);
    mat[4] = Math.cos(angle);
    //moving
    /*const ulMatrix = [ 1, 0, 0,
                         0, 1, 0, 
                         x, y, 1 ];*/
    const ulMatrix = [ Math.cos(angle), Math.sin(angle), 0,
                       -Math.sin(angle), Math.cos(angle), 0, 
                       x, y, 1 ];
    self.container.stopAnimate();
    self.container.animate({
      matrix: ulMatrix
    },self.duartion);
  }
  
  update() {
    const self = this;
    self._updateShape(); 
  }

  clear() {

  }

  destory() {

  }

  //wind shape generate
  _initializeShape() {
    const self = this;
    const data = self._constructShapeData();
    //draw wings
    for (let i = 0; i < LEVELS.length; i++) {
      const level = LEVELS[i];
      const vertices = self._windDirVertex(data[level]);
      const c = COLORS[level];
      for (let j = 0; j < DIRS.length; j++) {
        const dir = DIRS[j];
        const path = self._getShapePath(dir, vertices);
        const shape = self.container.addShape('path', {
          attrs: {
            path,
            fill: c,
            opacity: 0.5
          }
        });
        self[level + '_' + dir + '_wing'] = shape;
      }
    }
    //draw head
    const head = self.container.addShape('circle', {
      attrs: {
        fill: 'white',
        stroke: '#646464',
        lineWidth: 1,
        r: 5,
        x: 0,
        y: -self.radius/3
      }
    });
  }


  _updateShape(){
    const self = this;
    const data = self._constructShapeData();
    //draw wings
    for (let i = 0; i < LEVELS.length; i++) {
      const level = LEVELS[i];
      const vertices = self._windDirVertex(data[level]);
      const c = COLORS[level];
      for (let j = 0; j < DIRS.length; j++) {
        const dir = DIRS[j];
        const path = self._getShapePath(dir, vertices);
        const shape = self[level + '_' + dir + '_wing'];
        shape.animate({
          path
        }, self.duartion, 'easeLinear');
      }
    }
  }


  _windDirVertex(d) {
    const self = this;
    const startAngle = -90 * Math.PI / 180;
    const ne_angle = startAngle + 45 * Math.PI / 180;
    const nw_angle = startAngle + 315 * Math.PI / 180;
    const se_angle = startAngle + 135 * Math.PI / 180;
    const sw_angle = startAngle + 225 * Math.PI / 180;
    const ne = self._getVertexPosition(ne_angle, d.ne);
    const nw = self._getVertexPosition(nw_angle, d.nw);
    const se = self._getVertexPosition(se_angle, d.se);
    const sw = self._getVertexPosition(sw_angle, d.sw);

    const c = { x: 0, y: 0 };
    const w = { x: -self.radius, y: 0 };
    const e = { x: self.radius, y: 0 };
    const n = { x: 0, y: -self.radius };
    const s = { x: 0, y: self.radius };

    return { ne, nw, se, sw, w, e, n, s, c };
  }


  _getVertexPosition(angle, d) {
    const self = this;
    const radius = self._getRaidus(d);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y };
  }

  _getShapePath(dir, vertices) {
    if (dir === 'ne') {
      return [
        ['M', vertices.c.x, vertices.c.y],
        ['L', vertices.ne.x, vertices.ne.y],
        ['L', vertices.ne.x, vertices.c.y],
        ['Z']
      ];
    } else if (dir === 'se') {
      return [
        ['M', vertices.c.x, vertices.c.y],
        ['L', vertices.se.x, vertices.c.y],
        ['L', vertices.se.x, vertices.se.y],
        ['Z']
      ];
    } else if (dir === 'sw') {
      return [
        ['M', vertices.c.x, vertices.c.y],
        ['L', vertices.sw.x, vertices.c.y],
        ['L', vertices.sw.x, vertices.sw.y],
        ['Z']
      ];
    } else if (dir === 'nw') {
      return [
        ['M', vertices.c.x, vertices.c.y],
        ['L', vertices.nw.x, vertices.nw.y],
        ['L', vertices.nw.x, vertices.c.y],
        ['Z']
      ];
    }
  }

  //data prcessing
  //construction
  _constructShapeData() {
    const self = this;
    //low
    const low = { ne: self.data.low_wind_ne, se: self.data.low_wind_se, sw: self.data.low_wind_sw, nw: self.data.low_wind_nw };
    //mode
    const mode = { ne: self.data.mode_wind_ne, se: self.data.mode_wind_se, sw: self.data.mode_wind_sw, nw: self.data.mode_wind_nw };
    //high
    const high = { ne: self.data.high_wind_ne, se: self.data.high_wind_se, sw: self.data.high_wind_sw, nw: self.data.high_wind_nw };
    return { low, mode, high };
  }

  //mapping
  _getRaidus(d) {
    const self = this;
    const max = 150;
    const min = 0;
    return (d - min) / (max - min) * self.radius;
  }

}

module.exports = TyphoonShape;
