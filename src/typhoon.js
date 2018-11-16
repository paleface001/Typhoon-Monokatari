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
    self._initializeShape();
    self.canvas.draw();
  }

  update() {

  }

  clear() {

  }

  destory() {

  }

  //wind shape generate
  _initializeShape() {
    const self = this;
    const data = self._constructShapeData();
    const dirs = ['ne', 'se', 'sw', 'nw'];
    const levels = ['low', 'mode', 'high'];
    const colors = {'low':'#881678','mode':'#ed2236','high':'#e56524'}
    for (let i = 0; i < levels.length; i++) {
      const level = levels[i];
      const vertices = self._windDirVertex(data[level]);
      const c = colors[level];
      for (let j = 0; j < dirs.length; j++) {
        const dir = dirs[j];
        const path = self._getShapePath(dir, vertices);
        const shape = self.container.addShape('path', {
          attrs: {
            path,
            fill:c,
            opacity:0.5
          }
        });
        self[level + '_' + dir + '_wing'] = shape;
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
        ['L', vertices.e.x, vertices.ne.y],
        ['L', vertices.e.x, vertices.c.y],
        ['Z']
      ];
    } else if (dir === 'se') {
      return [
        ['M', vertices.c.x, vertices.c.y],
        ['L', vertices.e.x, vertices.c.y],
        ['L', vertices.e.x, vertices.se.y],
        ['Z']
      ];
    } else if (dir === 'sw') {
      return [
        ['M', vertices.c.x, vertices.c.y],
        ['L', vertices.w.x, vertices.c.y],
        ['L', vertices.w.x, vertices.sw.y],
        ['Z']
      ];
    } else if (dir === 'nw') {
      return [
        ['M', vertices.c.x, vertices.c.y],
        ['L', vertices.w.x, vertices.nw.y],
        ['L', vertices.w.x, vertices.c.y],
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

module.exports = Typhoon;
