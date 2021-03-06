const G = require('@antv/g');

//const POWER_COLOR = ['#bad1d3','#dacc76','#fdc52d','#f8812c','#f23c3e'];
const POWER_COLOR = ['#f69f91','#f08e8c','#e68088','#d67385','#bf6d84','#a66881','#88647f','#67607c','#365d7c'];

class TyphoonRoutes {
    constructor(cfg) {
        this.canvas = cfg.canvas;
        this.duartion = cfg.duartion;
        this._init_();
    }

    _init_() {
        const self = this;
        self.container = self.canvas.addGroup();
        self.pathes = self.container.addGroup();
        self.points = self.container.addGroup();
    }

    /*route data should contains start & end position of the route and raw data for color mapping*/
    addPath(routeData, currentData, prevData) {
        const self = this;
        self.routeData = routeData;
        const prev_color = self._powerMapping(prevData.level);
        const current_color = self._powerMapping(currentData.level);
        self.color = current_color;
        //draw path
        const dir = routeData.end.x - routeData.start.x;
        const path = self.pathes.addShape('path', {
            attrs: {
                path: [
                    ['M', routeData.start.x, routeData.start.y],
                    ['L', routeData.end.x, routeData.end.y]
                ],
                lineWidth: self._lineWidthMapping(currentData.level),
                stroke: (dir > 0) ? 'l(0) 0:' + prev_color + ' ' + '1:' + current_color : 'l(0) 0:' + current_color + ' ' + '1:' + prev_color,
                lineCap: 'round'
            }
        });
        self._adaptiveClipper(routeData.start, routeData.end, path);
        //draw marker
        if (self.level !== currentData.level) {          
            const outer_circle = self.points.addShape('circle', {
                attrs: {
                    r: 0,
                    fill: prev_color,
                    fillOpacity: 0,
                    x: routeData.start.x,
                    y: routeData.start.y,
                    stroke:'#ccccd0',
                    lineWidth:1
                }
            });
            outer_circle.animate({
                r: self._markerRadiusMapping(prevData.level),
                fillOpacity: 1
            }, 500, 'easeLinear');
        }

        self.level = currentData.level;
        self.path = path;
    }

    hide(){
        const self = this;
        self.points.remove();
        const pathes = self.pathes.get('children');
        for(let i=0; i<pathes.length; i++){
            const path = pathes[i];
            path.animate({
                lineWidth:2,
                opacity:0.2
            }, 1000, 'easeLinear');
        }
    }

    destory(){
        
    }

    getEdgeData(){
        const self = this;
        const nodes = [{x:self.routeData.start.x,y:self.routeData.start.y},
                       {x:self.routeData.end.x,y:self.routeData.end.y}];
        const link = {source:nodes[0],target:nodes[1],color:self.color,shape:self.path};
        return {nodes:nodes,link:link};
    }

    //data mapping
    _powerMapping(value) {
        const self = this;
        const max_level = 10;
        const min_level = 0;
        const binNum = POWER_COLOR.length;
        const step = (max_level - min_level) / binNum;
        const binIndex = Math.floor(value / step);
        return POWER_COLOR[binIndex];
    }

    _markerRadiusMapping(value) {
        const self = this;
        const max_level = 10;
        const min_level = 0;
        const max_size = 10;
        const min_size = 2;
        return min_size + (value - min_level) / (max_level - min_level) * (max_size - min_size);
    }

    _lineWidthMapping(value) {
        const self = this;
        const max_level = 10;
        const min_level = 0;
        const max_size = 6;
        const min_size = 2;
        return min_size + (value - min_level) / (max_level - min_level) * (max_size - min_size);
    }
    
    //clipping animation
    _adaptiveClipper(start, end, target) {
        const self = this;
        //step 1: x-direction or y-direction
        let dir;
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        if (Math.abs(dx) > Math.abs(dy)) {
            dir = 'x';
        } else {
            dir = 'y';
        }
        //step 2: create and bind clipper
        const bbox = target.getBBox();
        let clipperAttr;
        if (dir === 'x') {
            clipperAttr = {
                x: (dx < 0) ? bbox.maxX : bbox.minX,
                y: bbox.minY,
                width: 0,
                height: bbox.height,
                opacity: 0
            };
        } else {
            clipperAttr = {
                x: bbox.minX,
                y: (dy < 0) ? bbox.maxY : bbox.minY,
                width: bbox.width,
                height: 0,
                opacity: 0
            };
        }
        const cliper = self.pathes.addShape('rect', {
            attrs: clipperAttr
        });
        target.attr('clip', cliper);
        //step 3: construct animation attributes
        const attr = {};
        if (dir === 'x') {
            attr.width = bbox.width;
            if (dx < 0) attr.x = bbox.minX;
        }
        if (dir === 'y') {
            attr.height = bbox.height;
            if (dy < 0) attr.y = bbox.minY;
        }
        //step 4: animate
        cliper.animate(attr, self.duartion, 'easeLinear', function () {
            target.attr('clip', null);
            cliper.remove();
        });
    }

}

module.exports = TyphoonRoutes;