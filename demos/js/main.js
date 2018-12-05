//tempo timeline
function main(typhoonData,timeData,projection){
const startTime = '2017-07-20 00:00:00';
const endTime = '2017-12-31 12:00:00';
const startStamp = Date.parse(startTime);
const endStamp = Date.parse(endTime);
const step = 1000 * 60 * 60 * 12; //每六小时
let current = startStamp;
const typhoons = {};
const rawEdge = {nodes:[],links:[]};
const landfallPoints = [];
const canvas = new G2.G.Canvas({
    containerId: 'typhoon',
    width: $('#typhoon').width(),
    height: $('#typhoon').height(),
    renderer:'svg'
});
const interval = window.setInterval(function(){
    if (current < endStamp) {
        current += step;
        const timeString = _toTimeString(current);
        $('#time').text(timeString);
        readData(timeString);
      } else {
        clearInterval(interval);
        clearTyphoonRoute();
        bundlingEdge(rawEdge,svg,canvas);
        //clustering(landfallPoints,canvas);
      }
},1);

function readData(timeString){
    const currentData = timeData[timeString];
    const typhoonNames = [];
    if(currentData.length > 0){       
        for(let i =0; i<currentData.length; i++){
            const id = currentData[i].id;
            typhoonNames.push(id);
            const index = currentData[i].dataIndex;
            const data = typhoonData[id][index];
            let pos;
            if(typhoons.hasOwnProperty(id)){
                const tp = typhoons[id];
                pos = projection([data.lng,data.lat]);
                tp.setData(data);
                tp.setPosition(pos[0], pos[1]);
                tp.update();
                //add typhoon route data to edge raw data
                const edge  = tp.routes.getEdgeData();
                rawEdge.nodes.push(...edge.nodes);
                rawEdge.links.push(edge.link);
            }else{
                pos = projection([data.lng,data.lat]);
                const tp = new typhoon({
                    id,
                    data,
                    canvas,
                    position: {x:pos[0],y:pos[1]}
                });
                typhoons[id] = tp;
            }
            //save landfall data
            if(data.hasOwnProperty('landfall')){
                landfallPoints.push(pos);
            }
        }
    }
    checkTyphoons(typhoonNames);                             
}

function checkTyphoons(namelist){
    for(let key in typhoons){
        if( namelist.indexOf(key)<0 ){
            const tp = typhoons[key];
            window.setTimeout(function(){
                tp.hide();
            },200);
        }   
    }
}

function clearTyphoonRoute(){
    for(let key in typhoons){
        const tp = typhoons[key];
        tp.clear();  
    }
}


}//end of main


function _toTimeString(stamp) {
    const datetime = new Date();
    datetime.setTime(stamp);
    const year = datetime.getFullYear();
    let month = datetime.getMonth() + 1;
    if(month<10) month = '0'+month;
    let date = datetime.getDate();
    if(date<10) date = '0'+date;
    let hour = datetime.getHours();
    if(hour<10) hour = '0'+hour;
    return year.toString() + month.toString() + date.toString() + hour.toString();
}
