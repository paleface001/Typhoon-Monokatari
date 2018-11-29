const G = require('@antv/g');

const POWER_COLOR = ['#f23c3e', '#f8812c', '#fdc52d', '#dacc76', '#bad1d3', '#dee2e6'];

class TyphoonRoutes {
    constructor(cfg) {
        this.canvas = cfg.canvas;
        this.duartion = cfg.duartion;
        this._init_();
    }

    _init_() {
        const self = this;
        self.container = self.canvas.addGroup();
    }

    /*route data should contains start & end position of the route and raw data for color mapping*/
    addPath(routeData,currentData,prevData) {
        const self = this;
        const prev_color = self._powerMapping(prevData.level);
        const current_color = self._powerMapping(currentData.level);
        //draw path
        const dir = routeData.end.x - routeData.start.x;
        const path = self.container.addShape('path',{
            attrs:{
                path:[
                    ['M',routeData.start.x,routeData.start.y],
                    ['L',routeData.end.x,routeData.end.y]
                ],
                lineWidth:4,
                stroke:(dir>0)?'l(0) 0:'+ prev_color +' ' +'1:' + current_color:'l(0) 0:'+ current_color +' ' +'1:' + prev_color,
                strokeOpacity:0.5
            }
        });
        /*const bbox = path.getBBox();
        const cliper = self.container.addShape('rect',{
            attrs:{
                x:(dir<0)?bbox.maxX:bbox.minX,
                y:bbox.minY,
                width:0,
                height:bbox.maxY - bbox.minY,
                opacity:0
            }
        });
        path.attr('clip',cliper);
        const attr = {width:bbox.width};
        if(dir<0){
            attr.x = bbox.minX;
        }
        cliper.animate(attr, self.duartion, 'easeLinear',function(){
              path.attr('clip',null);
              cliper.remove();
          });*/
        self._adaptiveClipper(routeData.start,routeData.end,path);

        //draw marker
        const outer_circle = self.container.addShape('circle',{
            attrs:{
                r:0,
                fill:prev_color,
                fillOpacity:0,
                x:routeData.start.x,
                y:routeData.start.y
            }
        });
        outer_circle.animate({
            r:self._markerRadiusMapping(prevData.level),
            fillOpacity:0.5
          }, 500, 'easeLinear');
    }

    //data mapping
    _powerMapping(value) {
        const self = this;
        const max_level = 9;
        const min_level = 0;
        const binNum = POWER_COLOR.length;
        const step = (max_level - min_level) / binNum;
        const binIndex = Math.floor(value / step);

        return POWER_COLOR[binIndex];
    }

    _markerRadiusMapping(value){
        const self = this;
        const max_level = 9;
        const min_level = 0;
        const max_size = 10;
        const min_size = 2;
        return min_size + (value - min_level) / (max_level - min_level) * (max_size - min_size);
    }

    _adaptiveClipper(start,end,target){
        const self = this;
        //step 1: x-direction or y-direction
        let dir;
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        if( Math.abs(dx) > Math.abs(dy) ){
            dir = 'x';
        }else{
            dir = 'y';
        }
        //step 2: create and bind clipper
        const bbox = target.getBBox();
        let clipperAttr;
        if(dir === 'x'){
            clipperAttr = {
                x:(dx<0)?bbox.maxX:bbox.minX,
                y:bbox.minY,
                width:0,
                height:bbox.height,
                opacity:0
            };
        }else{
            clipperAttr = {
                x:bbox.minX,
                y:(dy<0)?bbox.maxY:bbox.minY,
                width:bbox.width,
                height:0,
                opacity:0
            };
        }
        const cliper = self.container.addShape('rect',{
            attrs:clipperAttr
        });
        target.attr('clip',cliper);
        //construct animation attributes
        const attr = {};
        if(dir === 'x') {
            attr.width = bbox.width;
            if(dx<0) attr.x = bbox.minX;
        }
        if(dir === 'y') {
            attr.height = bbox.height;
            if(dy<0) attr.y = bbox.minY;
        }
        //animate
        cliper.animate(attr, self.duartion, 'easeLinear',function(){
              target.attr('clip',null);
              cliper.remove();
        });
    }

}

module.exports = TyphoonRoutes;