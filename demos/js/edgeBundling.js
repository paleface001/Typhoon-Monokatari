function bundlingEdge(data, svg,canvas) {
    const line = d3.linkVertical()
        .x(function (d) { return d.x; })
        .y(function (d) { return d.y; });

    const links = svg.append("g").attr("id", "test")
        .selectAll("path.test")
        .data(data.links)
        .enter()
        .append("path")
        .attr("d", function(d){return arrow(d);})
        .attr('color',function(d){return d.color;})
        .attr('dir',function(d){return getDir(d);})
        .attr('cliperPathInit',function(d){return cliperPathInit(d);})
        .attr('cliperPath',function(d){return cliperPath(d);})
        .style("fill", function (d) { return d.color; })
        .style('opacity',0);
        
    const layout = d3.forceSimulation()
        .alphaDecay(0.05)//0.05
        .force("charge", d3.forceManyBody()
            .strength(5)//10
            .distanceMax(100)
        )
        .force("link", d3.forceLink()
            .strength(2)//0.8
            .distance(0)
        )
        .on("tick", function (d) {
            //links.attr("d", line);
        })
        .on("end", function (d) {
            links.attr("d", arrow);
            links.attr('cliperPathInit',cliperPathInit);
            links.attr('cliperPath',cliperPath);
            const shapes = svg.select('#test').selectAll('path').nodes();
            processBundle(shapes,canvas);
            canvas.draw();
        });
    layout.nodes(data.nodes);
}




/*------ assistance methods for edge bundling--------*/
function distance(source, target) {
    const dx2 = Math.pow(target.x - source.x, 2);
    const dy2 = Math.pow(target.y - source.y, 2);
    return Math.sqrt(dx2 + dy2);
}

function linear(value, range, domain) {
    return range[0] + (value - domain[0]) / (domain[1] - domain[0]) * (range[1] - range[0]);
}

function processBundle(shapes,canvas){
    for(let i=0; i<shapes.length; i++){
        const shape = shapes[i];
        const bbox = shape.getBBox();
        const size = bbox.width * bbox.height;
        if(size<1600){
            shape.remove();
        }else{
            const pathData = shape.getAttribute('d');
            const color = shape.getAttribute('color');
            const dir = shape.getAttribute('dir');
            const path = canvas.addShape('path',{
                attrs:{
                    path:pathData,
                    //fill:'l(90) 0:' + getRGB(color,1.0) + ' ' + '1:' + getRGB(color,0.0)
                    fill:directionColor(dir,color),
                    lineWidth:0,
                    opacity:1
                }
            });
            //cliper animation
            const cliperPathInit = shape.getAttribute('cliperPathInit');
            const cliperPath = shape.getAttribute('cliperPath');
            const cliper = canvas.addShape('path',{
                attrs:{
                    path:cliperPathInit,
                    opacity:0
                }
            });
            path.attr('clip',cliper);
           cliper.animate({
                path:cliperPath
            }, 800, 'easeLinear', function () {
                path.attr('clip', null);
                cliper.remove();
            },Math.random()*1000);
        }
    }
}

function arrow(d){
    const dx = d.target.x - d.source.x;
    const dy = d.target.y - d.source.y;
    const dir_vec = {
        x: dx,
        y: dy
      };
      //normalize
      var length = Math.sqrt(dir_vec.x * dir_vec.x + dir_vec.y * dir_vec.y);
      dir_vec.x *= 1 / length;
      dir_vec.y *= 1 / length;
      //rotate dir_vector by -90 and scale
      const left_angle = -Math.PI / 2;
      var x_left = Math.cos(left_angle) * dir_vec.x - Math.sin(left_angle) * dir_vec.y;
      var y_left = Math.sin(left_angle) * dir_vec.x + Math.cos(left_angle) * dir_vec.y;
      //rotate dir_vector by 90 and scale
      const right_angle = Math.PI / 2;
      var x_right = Math.cos(right_angle) * dir_vec.x - Math.sin(right_angle) * dir_vec.y;
      var y_right = Math.sin(right_angle) * dir_vec.x + Math.cos(right_angle) * dir_vec.y;

      const start = {x:d.source.x,y:d.source.y};
      const end = {x:d.source.x+0.9*dx,y:d.source.y+0.9*dy};

      const left_scale_x1 = x_left * 2;
      const left_scale_x2 = x_left * 8;

      const left_scale_y1 = y_left * 2;
      const left_scale_y2 = y_left * 8;

      const right_scale_x1 = x_right * 2;
      const right_scale_x2 = x_right * 8;

      const right_scale_y1 = y_right * 2;
      const right_scale_y2 = y_right * 8;

      const arrow_point = {x:d.source.x+0.8*dx,y:d.source.y+0.8*dy};

      const left1 = {x:arrow_point.x+left_scale_x1, y:arrow_point.y+left_scale_y1};
      const left2 = {x:arrow_point.x+left_scale_x2, y:arrow_point.y+left_scale_y2};

      const right1 = {x:arrow_point.x+right_scale_x1, y:arrow_point.y+right_scale_y1};
      const right2 = {x:arrow_point.x+right_scale_x2, y:arrow_point.y+right_scale_y2};


      return 'M'+start.x+','+start.y+ ' L'+left1.x+','+left1.y+' L'+left2.x+','+left2.y+' L'+end.x+','+end.y+' L'+right2.x+','+right2.y+' L'+right1.x+','+right1.y+ 'L'+start.x+','+start.y+' Z';

    //return 'M'+d.source.x+','+d.source.y+' L'+d.target.x+','+d.target.y;
}

function cliperPathInit(d){
    const dx = d.target.x - d.source.x;
    const dy = d.target.y - d.source.y;
    const dir_vec = {
        x: dx,
        y: dy
      };
      //normalize
      var length = Math.sqrt(dir_vec.x * dir_vec.x + dir_vec.y * dir_vec.y);
      dir_vec.x *= 1 / length;
      dir_vec.y *= 1 / length;
      //rotate dir_vector by -90 and scale
      const left_angle = -Math.PI / 2;
      var x_left = Math.cos(left_angle) * dir_vec.x - Math.sin(left_angle) * dir_vec.y;
      var y_left = Math.sin(left_angle) * dir_vec.x + Math.cos(left_angle) * dir_vec.y;
      //rotate dir_vector by 90 and scale
      const right_angle = Math.PI / 2;
      var x_right = Math.cos(right_angle) * dir_vec.x - Math.sin(right_angle) * dir_vec.y;
      var y_right = Math.sin(right_angle) * dir_vec.x + Math.cos(right_angle) * dir_vec.y;

      const left_x = d.source.x + x_left*30;
      const left_y = d.source.y + y_left*30;

      const right_x = d.source.x + x_right*30;
      const right_y = d.source.y + y_right*30;

      return 'M'+left_x+','+left_y+' L'+left_x+','+left_y+' L'+right_x+','+right_y+' L'+right_x+','+right_y+'Z';
}

function cliperPath(d){
    const dx = d.target.x - d.source.x;
    const dy = d.target.y - d.source.y;
    const dir_vec = {
        x: dx,
        y: dy
      };
      //normalize
      var length = Math.sqrt(dir_vec.x * dir_vec.x + dir_vec.y * dir_vec.y);
      dir_vec.x *= 1 / length;
      dir_vec.y *= 1 / length;
      //rotate dir_vector by -90 and scale
      const left_angle = -Math.PI / 2;
      var x_left = Math.cos(left_angle) * dir_vec.x - Math.sin(left_angle) * dir_vec.y;
      var y_left = Math.sin(left_angle) * dir_vec.x + Math.cos(left_angle) * dir_vec.y;
      //rotate dir_vector by 90 and scale
      const right_angle = Math.PI / 2;
      var x_right = Math.cos(right_angle) * dir_vec.x - Math.sin(right_angle) * dir_vec.y;
      var y_right = Math.sin(right_angle) * dir_vec.x + Math.cos(right_angle) * dir_vec.y;

      const left_bottom_x = d.source.x + x_left*30;
      const left_bottom_y = d.source.y + y_left*30;

      const right_bottom_x = d.source.x + x_right*30;
      const right_bottom_y = d.source.y + y_right*30;

      const left_top_x = d.target.x + x_left*30;
      const left_top_y = d.target.y + y_left*30;

      const right_top_x = d.target.x + x_right*30;
      const right_top_y = d.target.y + y_right*30;

      return 'M'+left_bottom_x+','+left_bottom_y+' L'+left_top_x+','+left_top_y+' L'+right_top_x+','+right_top_y+' L'+right_bottom_x+','+right_bottom_y+'Z';
}

function directionColor(dir,color){
    if(dir === 'up'){
        return 'l(90) 0:' + getRGB(color,0.8) + ' ' + '1:' + getRGB(color,0.0);
    }
    if(dir === 'down'){
        return 'l(90) 0:' + getRGB(color,0.0) + ' ' + '1:' + getRGB(color,0.8);
    }
    if(dir === 'left'){
        return 'l(0) 0:' + getRGB(color,0.8) + ' ' + '1:' + getRGB(color,0.0);
    }
    if(dir === 'right'){
        return 'l(0) 0:' + getRGB(color,0.0) + ' ' + '1:' + getRGB(color,0.8);
    }
}

function getDir(d){
    const dx = d.target.x - d.source.x;
    const dy = d.target.y - d.source.y;
    if(Math.abs(dx)>Math.abs(dy)){
        if(dx<0) return 'left';
        if(dx>0) return 'right';
    }
    else{
        if(dy>0) return 'down';
        if(dy<0) return 'up';
    }
}

//16进制颜色转rgb
function getRGB(hex,alpha){
    var rgb=[0,0,0];
    if(/#(..)(..)(..)/g.test(hex)){
        rgb=[parseInt(RegExp.$1,16),parseInt(RegExp.$2,16),parseInt(RegExp.$3,16)];
        rgb.push(alpha);
    };
    return "rgba("+rgb.join(",")+")";
}






/*--------- point cluster ---------*/
function clustering(points,container) {
    const clusters = clusterfck.kmeans(points, 5);
    for (let i = 0; i < clusters.length; i++) {
        const delay = Math.random()*1000;
        const cluster = clusters[i];
        const bbox = getBbox(cluster);
        const circle = container.addShape('circle',{
            attrs:{
                x:bbox.cx,
                y:bbox.cy,
                r:0,
                fill:'#0c51d0',
                fillOpacity:0.1,
                strokeOpacity:1
            }
        });
        circle.animate({
            r:bbox.size/2
        }, 300, 'easeLinear',delay);
        const innerCircle = container.addShape('circle',{
            attrs:{
                x:bbox.cx,
                y:bbox.cy,
                r:0,
                fill:'#0c51d0',
                opacity:0.8,
                shadowBlur: 5,
                shadowColor: 'rgba(0, 0, 0, .45)',
            }
        });
        innerCircle.animate({
            r:12
        }, 300, 'easeLinear',200,delay);
        const number = container.addShape('text',{
            attrs:{
                x:bbox.cx,
                y:bbox.cy,
                text:cluster.length,
                fill:'white',
                fontSize:12,
                textAlign:'center',
                textBaseline:'middle',
                opacity:0
            }
        });
        number.animate({
            opacity:1
        }, 300, 'easeLinear',400,delay);
    }
    container.draw();
}

//点集合中有点X，集合中不存在有点在横轴和纵轴的坐标均大于X，则X即为边缘点
function findBoundaryPoints(ps) {
    const boundaries = [ ];
    for (let i = 0; i < ps.length; i++) {
        const point = ps[i];
        if ( isBoundary(point,ps,i) ){
           boundaries.push(point);
        }
    }
    boundaries.sort(function (a, b) {
        return a[0] - b[0];
    });
    return boundaries;
}

function isBoundary (point,ps,index){
    for(let i=0; i<ps.length; i++){
        if(i !== index){
            const p = ps[i];
            if( p[0]>point[0] && p[1]>point[1] ){
                return false;
            }
        }
    }
    return true;
}

function getBbox(points){
    let maxX = 0;
    let minX = 10000;
    let maxY = 0;
    let minY = 10000;
    for(let i=0; i<points.length; i++){
        const x = points[i][0];
        const y = points[i][1];
        if(x>maxX) maxX = x;
        if(x<minX) minX = x;
        if(y>maxY) maxY = y;
        if(y<minY) minY = y;  
    }
    const width = maxX - minX;
    const height = maxY - minY;
    const size = Math.max(width,height);
    const cx = minX + width/2;
    const cy = minY + height/2;
    return { size,cx,cy};
}
