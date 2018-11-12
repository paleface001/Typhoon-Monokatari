const G = require('@antv/g');
const SCALED = 0.7;
const SUB_TICKCOUNT = 5;

class Timeline {
  constructor(cfg) {
    this.startTime = cfg.start;
    this.endTime = cfg.end;
    this.step = cfg.step;
    this.containerId = cfg.container;
    this.tickCount = cfg.tickCount;
    //style
    this.width = cfg.width;
    this.height = cfg.height;
    this.padding = cfg.padding ? cfg.padding : 40;
    this._init_();
  }

  _init_() {
    this.startStamp = this._toTimeStamp(this.startTime);
    this.endStamp = this._toTimeStamp(this.endTime);
    this.duration = this.endStamp - this.startStamp;
    this.current = this.startStamp;
    this.currentTick = Infinity;
    this._initUI();
  }

  start() {
    const self = this;
    self.update();
  }

  update() {
    const self = this;
    var _update = function () {
      if (self.current < self.endStamp) {
        self.current += self.step;
        self.animator = requestAnimationFrame(_update);
        self.render();
      } else {
        self.stop();
      }
    };
    self.animator = requestAnimationFrame(_update);
  }

  pause() {
    if (this.animator) {
      cancelAnimationFrame(this.animator);
    }
  }

  stop() {
    this.pause();
    this.current = this.startStamp;
  }


  render() {
    const self = this;
    const percent = (self.current - self.startStamp) / this.duration;
    const percentIndex = Math.floor(percent * self.tickCount);
    const timelineWidth = self.width - self.padding * 2;
    const progressWidth = timelineWidth * SCALED;
    //update current time tick
    if (percentIndex !== self.currentTick) {
      self.currentTick = percentIndex;
      const tickNumbers = self._calTickNumber();
      self.progressStart = self.padding + timelineWidth * tickNumbers[self.currentTick];
      const ticks = self.ticks.get('children');
      ticks.forEach(function (tick, index) {
        const posX = self.padding + timelineWidth * tickNumbers[index];
        const mat = [1, 0, 0, 0, 1, 0, posX, tick.attr('matrix')[7], 1];
        tick.stopAnimate();
        tick.animate({
          matrix: mat
        }, 300);
        const circle = tick.get('children')[0];
        if (index === self.currentTick) {
          circle.attr('fill', '#c3232d');
        } else {
          circle.attr('fill', '#7f7f7f');
        }
      });
    }
     //draw sub tick
     const sub_startStamp = self.startStamp + (self.currentTick / self.tickCount) * self.duration;
     const sub_endStamp = self.startStamp + ( (self.currentTick+1) / self.tickCount) * self.duration;
     self._drawSubTick(sub_startStamp, sub_endStamp, progressWidth);
     self.subTicks.attr('matrix')[6] = self.progressStart;

    //update progress bar
    self.progressBar.attr('path', [
      ['M', self.progressStart, self.height / 2],
      ['L', self.progressStart + progressWidth * (percent * self.tickCount - percentIndex), self.height / 2]
    ]);
    self.canvas.draw();
  }

  clear() {

  }

  destory() {

  }

  _toTimeStamp(value) {
    return Date.parse(value);
  }

  _toTimeString(stamp) {
    const datetime = new Date();
    datetime.setTime(stamp);
    const year = datetime.getFullYear();
    const month = datetime.getMonth() + 1;
    const date = datetime.getDate();
    const hour = datetime.getHours();
    return year + '-' + month + '-' + date;
  }

  _initUI() {
    const self = this;
    //container
    self.canvas = new G.Canvas({
      containerId: this.containerId,
      width: this.width,
      height: this.height,
      renderer: 'svg'
    });
    //进度条
    self.progressBar = self.canvas.addShape('path', {
      attrs: {
        path: [
          ['M', self.padding, self.height / 2],
          ['L', self.padding, self.height / 2]
        ],
        stroke: '#e4e4e4',
        lineWidth: 14,
        lineCap: 'round'
      }
    });
    //base line
    const baseLine = self.canvas.addShape('path', {
      attrs: {
        path: [['M', this.padding, this.height / 2],
        ['L', this.width - this.padding, this.height / 2]
        ],
        stroke: '#c6c6c8',
        lineWidth: 2
      }
    });
    //ticks
    const ticks = self.canvas.addGroup();
    for (let i = 0; i <= self.tickCount; i++) {
      const tickNumber = self.startStamp + self.duration / self.tickCount * i;
      const tick = ticks.addGroup();
      const circle = tick.addShape('circle', {
        attrs: {
          r: 8,
          fill: '#7f7f7f',
          x: 0,
          y: self.height / 2,
          stamp:tickNumber
        }
      });
      self._wrapperClickEvents(circle);
      const tickText = self._toTimeString(tickNumber);
      tick.addShape('text', {
        attrs: {
          text: tickText,
          fill: '#c6c6c8',
          fontSize: 12,
          textAlign: 'center',
          textBaseline: 'middle',
          x: 0,
          y: self.height / 2 + 20
        }
      });
      const x = self.padding + (self.width - self.padding * 2) / self.tickCount * i;
      tick.translate(x, 0);
    }
    self.ticks = ticks;
    //subTicks
    self.subTicks = self.canvas.addGroup();
    //draw
    self.canvas.draw();
  }

  _drawSubTick(start,end,segWidth){
    const self = this;
    const container = self.subTicks;
    const duration = end - start;
    const tickNum = SUB_TICKCOUNT;
    container.clear();
    for(let i = 1; i<tickNum; i++){
      const tick = container.addGroup();
      tick.addShape('path',{
        attrs:{
          path:[
            ['M',0,self.height/2 - 5],
            ['L',0,self.height/2 + 5]
          ],
          stroke:'#c3232d',
          lineWidth:2
        }
      });
      const tickNumber = start + duration / tickNum * i;
      const tickText = self._toTimeString(tickNumber);
      tick.addShape('text', {
        attrs: {
          text: tickText,
          fill: '#c6c6c8',
          fontSize: 12,
          textAlign: 'center',
          textBaseline: 'middle',
          x: 0,
          y: self.height / 2 + 20
        }
      });
      const x = segWidth / tickNum * i;
      tick.translate(x, 0);
    }
  }

  _calTickNumber() {
    const self = this;
    const tickNumbers = [];
    let percent = 0;
    for (let i = 0; i <= self.tickCount; i++) {
      tickNumbers.push(percent);
      if (i === this.currentTick) {
        percent += SCALED;
      } else {
        percent += (1.0 - SCALED) / (self.tickCount - 1);
      }
    }
    return tickNumbers;
  }

  _wrapperClickEvents(shape){
    const self = this;
    shape.on('mousedown',function(ev){
      const target = ev.target;
      const stamp = target.attr('stamp');
      self.current = stamp;
    });
  }


}

module.exports = Timeline;