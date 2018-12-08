//tempo timeline
function main(typhoonData, timeData, projection) {
    const startTime = '2017-07-20 00:00:00';
    const endTime = '2017-12-31 12:00:00';
    const startStamp = Date.parse(startTime);
    const endStamp = Date.parse(endTime);
    const step = 1000 * 60 * 60 * 12; //每六小时
    let current = startStamp;
    const typhoons = {};
    const landfallPoints = [];
    interval = window.setInterval(function () {
        if (current < endStamp) {
            current += step;
            updateTimePanel(current);
            const timeString = _toTimeString(current);
            readData(timeString);
        } else {
            clearInterval(interval);
            clearTyphoonRoute();
            bundlingEdge(rawEdge, svg, canvas);
            //clustering(landfallPoints,canvas);
        }
    }, 500);

    function readData(timeString) {
        const currentData = timeData[timeString];
        const typhoonNames = [];
        if (currentData.length > 0) {
            for (let i = 0; i < currentData.length; i++) {
                const id = currentData[i].id;
                typhoonNames.push(id);
                const index = currentData[i].dataIndex;
                const data = typhoonData[id][index];
                let pos;
                if (typhoons.hasOwnProperty(id)) {
                    const tp = typhoons[id];
                    pos = projection([data.lng, data.lat]);
                    tp.setData(data);
                    tp.setPosition(pos[0], pos[1]);
                    tp.update();
                    //add typhoon route data to edge raw data
                    /*const edge = tp.routes.getEdgeData();
                    rawEdge.nodes.push(...edge.nodes);
                    rawEdge.links.push(edge.link);*/
                } else {
                    pos = projection([data.lng, data.lat]);
                    const tp = new typhoon({
                        id,
                        data,
                        canvas,
                        position: { x: pos[0], y: pos[1] }
                    });
                    typhoons[id] = tp;
                    updatePlotshape(id);
                }
                //save landfall data
                if (data.hasOwnProperty('landfall')) {
                    landfallPoints.push(pos);
                }
            }
        }
        checkTyphoons(typhoonNames);
    }

    function checkTyphoons(namelist) {
        for (let key in typhoons) {
            if (namelist.indexOf(key) < 0) {
                const tp = typhoons[key];
                window.setTimeout(function () {
                    tp.hide();
                }, 200);
            }
        }
    }

    function clearTyphoonRoute() {
        for (let key in typhoons) {
            const tp = typhoons[key];
            tp.clear();
        }
    }

    function updateTimePanel(stamp) {
        const timeObj = _toTimeObj(stamp);
        $('#timePanel .date').text(timeObj.date);
        $('#timePanel .time').text(timeObj.time);
    }


}//end of main


/* ------ timeline plot in side panel -------- */
function _toTimeString(stamp) {
    const datetime = new Date();
    datetime.setTime(stamp);
    const year = datetime.getFullYear();
    let month = datetime.getMonth() + 1;
    if (month < 10) month = '0' + month;
    let date = datetime.getDate();
    if (date < 10) date = '0' + date;
    let hour = datetime.getHours();
    if (hour < 10) hour = '0' + hour;
    return year.toString() + month.toString() + date.toString() + hour.toString();
}

function _toTimeObj(stamp) {
    const datetime = new Date();
    datetime.setTime(stamp);
    const year = datetime.getFullYear();
    let month = datetime.getMonth() + 1;
    if (month < 10) month = '0' + month;
    let date = datetime.getDate();
    if (date < 10) date = '0' + date;
    let hour = datetime.getHours();
    if (hour < 10) hour = '0' + hour;
    return { date: year + ' 年 ' + month + ' 月 ' + date + ' 日 ', time: hour + ' : 00' }
}

function timelineChart(data) {
    const shapes = {};
    const width = $('#timeDataPanel').width();
    const height = $('#timeDataPanel').height();
    const canvas = new G2.G.Canvas({
        containerId: 'timeDataPanel',
        width,
        height: height + height / 12,
        renderer: 'svg'
    });
    //draw month axis
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const axisContainer = canvas.addGroup();
    const padding = 40;
    const axisHeight = height / 12;
    for (let i = 1; i <= 12; i++) {
        const y = axisHeight * i;
        const path = [
            ['M', padding, y],
            ['L', width, y]
        ];
        axisContainer.addShape('path', {
            attrs: {
                path,
                stroke: '#969696',
                lineWidth: 1
            }
        });
        axisContainer.addShape('text', {
            attrs: {
                text: months[i - 1],
                x: 10,
                y: y,
                textBaseline: 'middle',
                fontSize: 12,
                fill: '#969696'
            }
        });
    }

    //typhoon shape
    const shapeGrooup = canvas.addGroup();
    for (let key in data) {
        const d = data[key];
        const level = getMaxLevel(d);
        const startData = d[0];
        const startTime = timeSegment(startData.time);
        const start = timelineMapping(startTime, axisHeight, width - padding - axisHeight, padding + axisHeight / 2);
        const radius = levelRadiusMapping(level, axisHeight);
        const color = levelColorMapping(level);
        const path = [
            ['M', start.x - radius, start.y],
            ['A', radius, radius, 0, 0, 1, start.x + radius, start.y]
        ];
        const shape = shapeGrooup.addShape('path', {
            attrs: {
                path,
                fill: color,
                stroke: color,
                strokeOpacity: 0.8,
                lineWidth: 2,
                fillOpacity: 0
            }
        });

        shapes[key] = shape;
    }

    canvas.draw();
    return shapes;

}

function timelineMapping(timeData, segHeight, segWidth, padding) {
    const month = timeData.month;
    const day = timeData.date;
    const y = segHeight * month;
    const x = padding + (day / 31) * segWidth;
    return { x, y };
}

function levelRadiusMapping(value, height) {
    const max_level = 10;
    const min_level = 0;
    const max_size = height / 2;
    const min_size = 2;
    return min_size + (value - min_level) / (max_level - min_level) * (max_size - min_size);
}

function levelColorMapping(value) {
    const colors = ['#f69f91', '#f08e8c', '#e68088', '#d67385', '#bf6d84', '#a66881', '#88647f', '#67607c', '#365d7c'];
    const max_level = 10;
    const min_level = 0;
    const binNum = colors.length;
    const step = (max_level - min_level) / binNum;
    const binIndex = Math.floor(value / step);
    return colors[binIndex];
}

function getMaxLevel(d) {
    let max = 0;
    for (let i = 0; i < d.length; i++) {
        const level = d[i].level;
        if (level > max) max = level;
    }
    return max;
}

function timeSegment(string) {
    const year = parseInt(string.slice(0, 4));
    const month = parseInt(string.slice(4, 6));
    const date = parseInt(string.slice(6, 8));
    return { year, month, date };
}

function updatePlotshape(id) {
    const shape = plotShapes[id];
    shape.animate({
        fillOpacity: 0.8
    }, 500, 'easeLinear');
}

//part3 edgeBundling
function edgeDataPreparation(typhoonData, projection) {
    const edges = { nodes: [], links: [] };
    for (let key in typhoonData) {
        const data = typhoonData[key];
        for (let i = 1; i < data.length; i++) {
            const sourceData = data[i - 1];
            const targetData = data[i];
            const source = projection([sourceData.lng, sourceData.lat]);
            const target = projection([targetData.lng,targetData.lat]);
            const nodes = [{ x: source[0], y: source[1] },{ x: target[0], y: target[1] }];
            const link = { source: nodes[0], target: nodes[1], color: levelColorMapping(data[i].level) };
            edges.nodes.push(...nodes);
            edges.links.push(link);
        }
    }
    return edges;
}



