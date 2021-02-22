class Recorder extends AudioWorkletProcessor {

  constructor() {
    super();
    this._bufferSize = 4096;
    this._buffer = new Float32Array(this._bufferSize);
    this._currentIndex = 0;


  }

  _handleAudioData(audioData) {
    const roomRemaing=this._bufferSize - this._currentIndex;

    if (roomRemaing > audioData.length) {
      this._buffer.set(audioData, this._currentIndex)
      this._currentIndex += audioData.length
    }else if (roomRemaing == audioData.length){
      this._buffer.set(audioData, this._currentIndex)
      this._sendBuffer()
      this._currentIndex=0;
    } else {
      const fits = audioData.slice(0, roomRemaing);
      const remaining = audioData.slice(roomRemaing);
      this._buffer.set(fits, this._currentIndex);
      this._sendBuffer()
      this._buffer.set(remaining, 0);
      this._currentIndex=remaining.length;  
    }

  }
  _sendBuffer() { 
    this.port.postMessage({
      type: 'micData',
      value: this._buffer
    })
  }
  process(inputs, outputs, parameters) {
    const audioData = inputs[0][0] 
    if (audioData){
      this._handleAudioData(audioData);  
    }
    return true

  }

}
registerProcessor("recorder", Recorder);