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
        const prev_color = self._powerMapping(prevData.maxWind);
        const current_color = self._powerMapping(currentData.maxWind);
        //draw path
        const path = self.container.addShape('path',{
            attrs:{
                path:[
                    ['M',routeData.start.x,routeData.start.y],
                    ['L',routeData.end.x,routeData.end.y]
                ],
                lineWidth:10,
                stroke:'l(0) 0:'+ prev_color +' ' +'1:' + current_color,
                strokeOpacity:0.2,
                lineCap:'round'
            }
        });
        /*const bbox = path.getBBox();
        const cliper = self.container.addShape('rect',{
            attrs:{
                x:bbox.minX,
                y:bbox.minY,
                width:0,
                height:bbox.maxY - bbox.minY,
                opacity:0
            }
        });
        path.attr('clip',cliper);
        cliper.animate({
            width:bbox.maxX - bbox.minX
          }, self.duartion, 'easeLinear',function(){
              path.attr('clip',null);
              cliper.remove();
          });

        //draw marker
        const outer_circle = self.container.addShape('circle',{
            attrs:{
                r:0,
                fill:prev_color,
                fillOpacity:0,
                x:routeData.start.x,
                y:routeData.start.y,
                stroke:'#aaaaaa',
                lineWidth:1
            }
        });
        outer_circle.animate({
            r:self._markerRadiusMapping(prevData.maxWind),
            fillOpacity:0.5
          }, 500, 'easeLinear');
        
        const inner_circle = self.container.addShape('circle',{
            attrs:{
                r:2,
                fill:'#000000',
                fillOpacity:0,
                x:routeData.start.x,
                y:routeData.start.y,
            }
        });
        inner_circle.animate({
            fillOpacity:0.5
          }, 500, 'easeLinear');*/
    }


    //data mapping
    _powerMapping(value) {
        const self = this;
        const max_power = 165;
        const min_power = 0;
        const binNum = POWER_COLOR.length;
        const step = (max_power - min_power) / binNum;
        const binIndex = Math.floor(value / step);

        return POWER_COLOR[binIndex];
    }

    _markerRadiusMapping(value){
        const self = this;
        const max_power = 165;
        const min_power = 0;
        const max_size = 10;
        const min_size = 2.5;
        return min_size + (value - min_power) / (max_power - min_power) * (max_size - min_size);
    }

}

module.exports = TyphoonRoutes;