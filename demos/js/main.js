//tempo timeline
function main(typhoonData,timeData,projection){
const startTime = '2017-09-12 00:00:00';
const endTime = '2017-12-31 12:00:00';
const startStamp = Date.parse(startTime);
const endStamp = Date.parse(endTime);
const step = 1000 * 60 * 60 * 12; //每六小时
let current = startStamp;
let currentName;
const typhoons = {};
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
      }
},500);

function readData(timeString){
    const currentData = timeData[timeString];
    const typhoonNames = [];
    if(currentData.length > 0){
        const output = [];        
        for(let i =0; i<currentData.length; i++){
            const id = currentData[i].id;
            typhoonNames.push(id);
            const index = currentData[i].dataIndex;
            const data = typhoonData[id][index];
            if(typhoons.hasOwnProperty(id)){
                const tp = typhoons[id];
                const pos = projection([data.lng,data.lat]);
                tp.setData(data);
                tp.setPosition(pos[0], pos[1]);
                tp.update();
            }else{
                const pos = projection([data.lng,data.lat]);
                const tp = new typhoon({
                    id,
                    data,
                    canvas,
                    position: {x:pos[0],y:pos[1]}
                });
                typhoons[id] = tp;
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
                tp.destory();
            },200);
        }   
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
