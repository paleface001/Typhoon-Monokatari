//tempo timeline
function main(typhoonData,timeData,projection){
const startTime = '2013-05-27 12:00:00';
const endTime = '2015-11-29 12:00:00';
const startStamp = Date.parse(startTime);
const endStamp = Date.parse(endTime);
const step = 1000 * 60 * 60 * 6; //每六小时
let current = startStamp;
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
        readData(timeString);
      } else {
        clearInterval(interval);
      }
},500);

function readData(timeString){
    const currentData = timeData[timeString];
    if(currentData.length > 1){
        const output = [];
        for(let i =0; i<currentData.length; i++){
            const id = currentData[i].id;
            const index = currentData[i].dataIndex;
            const data = typhoonData[id].datas[index];
            if(typhoons.hasOwnProperty(id)){
                const tp = typhoons[id];
                const lat = parseCoord(data.lat);
                const lng = parseCoord(data.lng);
                const pos = projection([lng,lat]);
                tp.setData(data);
                tp.setPosition(pos[0], pos[1]);
                tp.update();
            }else{
                const lat = parseCoord(data.lat);
                const lng = parseCoord(data.lng);
                const pos = projection([lng,lat]);
                const tp = new typhoon({
                    data,
                    canvas,
                    position: {x:pos[0],y:pos[1]}
                });
                typhoons[id] = tp;
                
            }
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
    hour = hour + ':00:00'
    return year + '-' + month + '-' + date +' '+hour;
}

function parseCoord(string){
    const dir = string[string.length-1];
    let number = parseFloat(string.substring(0,string.length-1));
    if(dir === 'S' || dir === 'W'){
        number *= -1;
    }
    return number;
}