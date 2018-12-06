const G = require('@antv/g');

const DIRS = ['ne', 'se', 'sw', 'nw'];
//const POWER_COLOR = ['#bad1d3','#dacc76','#fdc52d','#f8812c','#f23c3e'];
const POWER_COLOR = ['#f69f91','#f08e8c','#e68088','#d67385','#bf6d84','#a66881','#88647f','#67607c','#365d7c'];


class TyphoonShape {
  constructor(cfg) {
    this.id = cfg.id;
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

  moveTo(x, y) {
    const self = this;
    //heading
    const dx = x - self.x;
    const dy = y - self.y;
    const angle = Math.atan(dy / dx) + Math.PI / 2;
    const mat = self.container.attr('matrix');
    mat[0] = Math.cos(angle);
    mat[1] = Math.sin(angle);
    mat[3] = -Math.sin(angle);
    mat[4] = Math.cos(angle);
    //moving
    /*const ulMatrix = [ 1, 0, 0,
                         0, 1, 0, 
                         x, y, 1 ];*/
    const ulMatrix = [Math.cos(angle), Math.sin(angle), 0,
    -Math.sin(angle), Math.cos(angle), 0,
      x, y, 1];
    self.container.stopAnimate();
    self.container.animate({
      matrix: ulMatrix
    }, self.duartion);
  }

  update() {
    const self = this;
    self._updateShape();
    self.head.attr('y',-self.radius - 5);
  }

  hide(){
    const self = this;
    const children = self.container.get('children');
    for(let i=0; i<children.length; i++){
      const element = children[i];
      element.animate({
        opacity:0
    }, 1000, 'easeLinear');
    }
  }

  //wind shape generate
  _initializeShape() {
    const self = this;
    const vertices = self._windDirVertex(self.data);
    //draw wings
    /*for (let i = 0; i < DIRS.length; i++) {
      const dir = DIRS[i];
      const path = self._getShapePath(dir, vertices);
      const shape = self.container.addShape('path', {
        attrs: {
          path,
          fill: '#ccc',
          opacity: 1
        }
      });
      self[dir + '_wing'] = shape;
    }*/
    const color = self._powerMapping(self.data.level);
    const left_upper_path = [
      ['M',vertices.c.x,vertices.c.y],
      ['L',vertices.ne.x,vertices.ne.y],
      ['A',self.radius/2,self.radius/2,0,0,1,vertices.c.x,vertices.c.y],
      ['Z']
    ];
    self.left_upper_wing = self.container.addShape('path',{
      attrs:{
        path:left_upper_path,
        fill:color,
        opacity:0.9
      }
    });
    const left_lower_path = [
      ['M',vertices.c.x,vertices.c.y],
      ['L',vertices.se.x,vertices.se.y],
      ['A',self.radius/2,self.radius/2,0,0,0,vertices.c.x,vertices.c.y],
      ['Z']
    ];
    self.left_lower_wing = self.container.addShape('path',{
      attrs:{
        path:left_lower_path,
        fill:color,
        opacity:0.9
      }
    });
    const right_upper_path = [
      ['M',vertices.c.x,vertices.c.y],
      ['L',vertices.nw.x,vertices.nw.y],
      ['A',self.radius/2,self.radius/2,0,0,0,vertices.c.x,vertices.c.y],
      ['Z']
    ];
    self.right_upper_wing = self.container.addShape('path',{
      attrs:{
        path:right_upper_path,
        fill:color,
        opacity:0.9
      }
    });
    const right_lower_path = [
      ['M',vertices.c.x,vertices.c.y],
      ['L',vertices.sw.x,vertices.sw.y],
      ['A',self.radius/2,self.radius/2,0,0,1,vertices.c.x,vertices.c.y],
      ['Z']
    ];
    self.right_lower_wing = self.container.addShape('path',{
      attrs:{
        path:right_lower_path,
        fill:color,
        opacity:0.9
      }
    });
    //draw head
    self.head = self.container.addShape('text', {
      attrs: {
        text:self.id,
        fontSize:14,
        fontWeight:'bold',
        fill:'#1e1e1e',
        stroke:'white',
        lineWidth:1,
        textAlign:'center',
        textBaseline:'middle',
        x:0,
        y:-self.radius - 20
      }
    });
  }


  _updateShape() {
    const self = this;
    //mapping shape

    const vertices = self._windDirVertex(self.data);
    const color = self._powerMapping(self.data.level);
    //draw wings
    /*for (let i = 0; i < DIRS.length; i++) {
      const dir = DIRS[i];
      const path = self._getShapePath(dir, vertices);
      const shape = self[dir + '_wing'];
      shape.animate({
        path
      }, self.duartion, 'easeLinear');
    }*/
    const left_upper_path = [
      ['M',vertices.c.x,vertices.c.y],
      ['L',vertices.ne.x,vertices.ne.y],
      ['A',self.radius/10,self.radius/10,0,0,1,vertices.c.x,vertices.c.y],
      ['Z']
    ];
    self.left_upper_wing.animate({
      fill:color,
      path:left_upper_path
    }, self.duartion, 'easeLinear');
    const left_lower_path = [
      ['M',vertices.c.x,vertices.c.y],
      ['L',vertices.se.x,vertices.se.y],
      ['A',self.radius/10,self.radius/10,0,0,0,vertices.c.x,vertices.c.y],
      ['Z']
    ];
    self.left_lower_wing.animate({
      fill:color,
      path:left_lower_path
    }, self.duartion, 'easeLinear');
    const right_upper_path = [
      ['M',vertices.c.x,vertices.c.y],
      ['L',vertices.nw.x,vertices.nw.y],
      ['A',self.radius/10,self.radius/10,0,0,0,vertices.c.x,vertices.c.y],
      ['Z']
    ];
    self.right_upper_wing.animate({
      fill:color,
      path:right_upper_path
    }, self.duartion, 'easeLinear');
    const right_lower_path = [
      ['M',vertices.c.x,vertices.c.y],
      ['L',vertices.sw.x,vertices.sw.y],
      ['A',self.radius/10,self.radius/10,0,0,1,vertices.c.x,vertices.c.y],
      ['Z']
    ];
    self.right_lower_wing.animate({
      fill:color,
      path:right_lower_path
    }, self.duartion, 'easeLinear');
  }

  _windDirVertex(d) {
    const self = this;
    const level = d.level;
    const startAngle = -90 * Math.PI / 180;
    const ne_angle = startAngle + 45 * Math.PI / 180;
    const nw_angle = startAngle + 315 * Math.PI / 180;
    const se_angle = startAngle + 135 * Math.PI / 180;
    const sw_angle = startAngle + 225 * Math.PI / 180;
    const ne = self._getVertexPosition(ne_angle, level);
    const nw = self._getVertexPosition(nw_angle, level);
    const se = self._getVertexPosition(se_angle, level);
    const sw = self._getVertexPosition(sw_angle, level);

    const c = { x: 0, y: 0 };
    const w = { x: -self.radius, y: 0 };
    const e = { x: self.radius, y: 0 };
    const n = { x: 0, y: -self.radius };
    const s = { x: 0, y: self.radius };

    return { ne, nw, se, sw, w, e, n, s, c };
  }


  _getVertexPosition(angle, d) {
    const self = this;
    self.radius = self._getRaidus(d);
    const x = Math.cos(angle) * self.radius;
    const y = Math.sin(angle) * self.radius;
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


  //mapping
  _getRaidus(d) {
    const self = this;
    const max = 10;
    const min = 0;
    const max_size = 40;
    const min_size = 15;
    return min_size + (d - min) / (max - min) * (max_size - min_size);
  }

  _powerMapping(value) {
    const self = this;
    const max_level = 10;
    const min_level = 0;
    const binNum = POWER_COLOR.length;
    const step = (max_level - min_level) / binNum;
    const binIndex = Math.floor(value / step);
    return POWER_COLOR[binIndex];
}

}

module.exports = TyphoonShape;
