
const ctx = new AudioContext()
const elStatus = document.querySelector('#status')
const elButton = document.querySelector('button')

init().catch(showError)

async function init() {
  ctx.suspend()
  // init AudioWorklet
  await ctx.audioWorklet.addModule('recorder_process.js')
  elButton.addEventListener('click', onBtnClick)

}


const recordAndPlayBack = async() => {


  // keep recorded data in array
  const recordedData=[];


  const recorderNode = new AudioWorkletNode(ctx, 'recorder')
  //recieve data from worklet
  recorderNode.port.onmessage = (e) => {
    
    recordedData.push(e.data.value)
    
  }
  


  // record the microphone
  const audioStream = await navigator.mediaDevices.getUserMedia({"audio":{"deviceId":"default"}});
  const streamSource = ctx.createMediaStreamSource(audioStream);
  recorderNode.connect(ctx.destination);
  streamSource.connect(recorderNode);



  //Playback after 5 secs
  setTimeout(() => playBack(float32Flatten(recordedData)), 5000);


}

const playBack = (RawData) => {
    
    const sourceNode= ctx.createBufferSource();
    const buffer =new AudioBuffer({length: RawData.length, numberOfChannels: 1, sampleRate: ctx.sampleRate});
    buffer.copyToChannel(RawData, 0, 0);
    sourceNode.buffer= buffer
    sourceNode.connect(ctx.destination)
    sourceNode.start()
    



}


const float32Flatten = (arrays) => {

    const nFrames = arrays.reduce((acc, elem) => acc + elem.length, 0)
    const result = new Float32Array(nFrames);
    let current =0
    arrays.forEach((array)=> {
        result.set(array, current)
        current += array.length;
    });
    return result;
 }   




// set button text
function onBtnClick(evt, isForcedPause) {
  ctx.resume()
  recordAndPlayBack()
  
}



function showError(e) {
  status(`ERROR: ${e}`)
}
