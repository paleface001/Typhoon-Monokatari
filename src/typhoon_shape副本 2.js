const G = require('@antv/g');

const DIRS = ['ne', 'se', 'sw', 'nw'];

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
    let dir = 1;
    if(dx<0){
      dir = -1;
    }
    const angle = Math.atan(dy/dx) + Math.PI/2*dir;
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
    /*const vertices = self._windDirVertex();
    const left_upper_path = [
      ['M',vertices.c.x,vertices.c.y],
      ['L',vertices.ne.x,vertices.ne.y],
      ['A',self.radius/2,self.radius/2,0,0,1,vertices.c.x,vertices.c.y],
      ['Z']
    ];
    self.left_upper_wing = self.container.addShape('path',{
      attrs:{
        path:left_upper_path,
        fill:'blue',
        opacity:0.7
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
        fill:'blue',
        opacity:0.7
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
        fill:'blue',
        opacity:0.7
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
        fill:'blue',
        opacity:0.7
      }
    });
    
    //draw head
    const head = self.container.addShape('circle', {
      attrs: {
        fill: 'white',
        stroke: '#646464',
        lineWidth: 1,
        r: 5,
        x: 0,
        y: -self.radius/2
      }
    });*/
    const id = self.container.addShape('text',{
      attrs:{
        text:'test',
        textAlign:'center',
        x:0,
        y:0,
        fontSize:16,
        fill:'black',
        fontWeight:'300'
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


  _windDirVertex() {
    const self = this;
    const startAngle = -90 * Math.PI / 180;
    const ne_angle = startAngle + 30 * Math.PI / 180;
    const nw_angle = startAngle + 330 * Math.PI / 180;
    const se_angle = startAngle + 150 * Math.PI / 180;
    const sw_angle = startAngle + 210 * Math.PI / 180;
    const ne = self._getVertexPosition(ne_angle,self.radius);
    const nw = self._getVertexPosition(nw_angle,self.radius);
    const se = self._getVertexPosition(se_angle,self.radius*0.95);
    const sw = self._getVertexPosition(sw_angle,self.radius*0.95);

    const c = { x: 0, y: 0 };
    const w = { x: -self.radius, y: 0 };
    const e = { x: self.radius, y: 0 };
    const n = { x: 0, y: -self.radius };
    const s = { x: 0, y: self.radius };

    return { ne, nw, se, sw, w, e, n, s, c };
  }


  _getVertexPosition(angle,radius) {
    const self = this;
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
  //mapping
  _getRaidus(d) {
    const self = this;
    const max = 150;
    const min = 0;
    return (d - min) / (max - min) * self.radius;
  }

}

module.exports = TyphoonShape;
