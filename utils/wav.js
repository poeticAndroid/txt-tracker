const
  Binary = require("./bin")

class Wave {
  constructor() {
    this.data = new Binary()
    this.reset()
  }
  reset(channelCount = 1, bitsPerSample = 16, sampleRate = 44100) {
    this.data.reset()
    this.channelCount = channelCount
    this.bitsPerSample = bitsPerSample
    this.sampleRate = sampleRate

    this.audioFormat = 1
    this.byteRate = this.sampleRate * this.channelCount * (this.bitsPerSample / 8)
    this.blockAlign = this.channelCount * (this.bitsPerSample / 8)
  }
  getSampleLength() {
    return this.data.length / this.channelCount / (this.bitsPerSample / 8)
  }
  fromBuffer(buf) {
    let bin = new Binary()
    bin.fromBuffer(buf)
    if (bin.readString(4) !== "RIFF") return console.error("Unsupported sample format!")
    bin.readUIntLE(4)
    if (bin.readString(4) !== "WAVE") return console.error("Unsupported sample format!")
    this._skipToChunck(bin, "fmt ")
    this.audioFormat = bin.readUIntLE(2)
    this.channelCount = bin.readUIntLE(2)
    this.sampleRate = bin.readUIntLE(4)
    this.byteRate = bin.readUIntLE(4)
    this.blockAlign = bin.readUIntLE(2)
    this.bitsPerSample = bin.readUIntLE(2)
    this._skipToChunck(bin, "data")
    this.data.fromBuffer(bin.readBuffer())
  }
  toBuffer() {
    let bin = new Binary()
    bin.writeString("RIFF")
    bin.writeIntLE(4, 36 + this.data.length)
    bin.writeString("WAVE")

    let fmt = new Binary(1)
    fmt.writeIntLE(2, this.audioFormat)
    fmt.writeIntLE(2, this.channelCount)
    fmt.writeIntLE(4, this.sampleRate)
    fmt.writeIntLE(4, this.byteRate)
    fmt.writeIntLE(2, this.blockAlign)
    fmt.writeIntLE(2, this.bitsPerSample)
    this._writeChunk(bin, "fmt ", fmt)
    this._writeChunk(bin, "data", this.data)
    return bin.toBuffer()
  }
  toJSON(key) {
    return Buffer.from(this.toBuffer()).toString("base64")
  }

  readSInt8() {
    switch (this.bitsPerSample) {
      case 8:
        return this.data.readUIntLE(1) - 128
      case 16:
        this.data.readSIntLE(1)
        return this.data.readSIntLE(1)
    }
  }
  readSInt16() {
    switch (this.bitsPerSample) {
      case 8:
        let val = this.data.readUIntLE(1)
        val = val * 256 + val
        return val - 32768
      case 16:
        return this.data.readSIntLE(2)
    }
  }

  writeSInt8(val) {
    switch (this.bitsPerSample) {
      case 8:
        return this.data.writeIntLE(1, val + 128)
      case 16:
        this.data.writeIntLE(1, val)
        return this.data.writeIntLE(1, val)
    }
  }
  writeSInt16(val) {
    switch (this.bitsPerSample) {
      case 8:
        val += 32768
        val = Math.floor(val / 256)
        return this.data.writeIntLE(1, val)
      case 16:
        return this.data.writeIntLE(2, val)
    }
  }

  _skipToChunck(bin, id) {
    let _id = bin.readString(4)
    let _len = bin.readUIntLE(4)
    while (_id !== id && !bin.isEOF()) {
      bin.skip(_len)
      _id = bin.readString(4)
      _len = bin.readUIntLE(4)
    }
  }
  _writeChunk(bin, id, chunk) {
    bin.writeString(id, 4)
    bin.writeIntLE(4, chunk.length)
    bin.writeBuffer(chunk.toBuffer())
  }
}

module.exports = Wave
