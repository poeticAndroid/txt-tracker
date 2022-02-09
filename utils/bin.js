class Binary {
  constructor(len = 1024) {
    this.buffer = new ArrayBuffer(len)
    this.reset()
  }
  reset() {
    this.uint8Array = new Uint8Array(this.buffer)
    this.pos = 0
    this.length = 0
    this._bits = ""
  }
  jumpTo(pos) {
    this.pos = pos
    this._bits = ""
  }
  skip(pos) {
    this.pos += pos
    this._bits = ""
  }
  isEOF() {
    return this.pos >= this.length
  }
  fromBuffer(buf) {
    this.reset()
    this.writeBuffer(buf)
    this.jumpTo(0)
  }
  toBuffer() {
    return this.buffer.slice(0, this.length)
  }

  readBuffer(len = this.length - this.pos) {
    return this.buffer.slice(this.pos, this.pos += len)
  }
  readUIntLE(len) {
    let val = 0
    let k = 1
    for (let i = 0; i < len; i++) {
      val += k * this.uint8Array[this.pos++]
      k *= 256
    }
    return val
  }
  readUIntBE(len) {
    let val = 0
    for (let i = 0; i < len; i++) {
      val *= 256
      val += this.uint8Array[this.pos++]
    }
    return val
  }
  readSIntLE(len) {
    let val = 0
    let k = 1
    for (let i = 0; i < len; i++) {
      val += k * this.uint8Array[this.pos++]
      k *= 256
    }
    if (val >= k / 2) {
      val -= k
    }
    return val
  }
  readSIntBE(len) {
    let val = 0
    let k = 1
    for (let i = 0; i < len; i++) {
      val *= 256
      val += this.uint8Array[this.pos++]
      k *= 256
    }
    if (val >= k / 2) {
      val -= k
    }
    return val
  }
  readUIntBits(len) {
    let val = 0
    while (this._bits.length < len) {
      this._bits += ("00000000" + this.uint8Array[this.pos++].toString(2)).slice(-8)
    }
    for (let i = 0; i < len; i++) {
      val *= 2
      val += parseInt(this._bits.charAt(0))
      this._bits = this._bits.slice(1)
    }
    return val
  }
  readSIntBits(len) {
    let val = 0
    let k = 1
    while (this._bits.length < len) {
      this._bits += ("00000000" + this.uint8Array[this.pos++].toString(2)).slice(-8)
    }
    for (let i = 0; i < len; i++) {
      val *= 2
      val += parseInt(this._bits.charAt(0))
      this._bits = this._bits.slice(1)
      k *= 2
    }
    if (val >= k / 2) {
      val -= k
    }
    return val
  }
  readString(len) {
    let data = this.readBuffer(len)
    let decoder = new TextDecoder()
    let text = decoder.decode(data)
    if (text.includes("\0")) text = text.substring(0, text.indexOf("\0"))
    return text
  }

  writeBuffer(buf, len = buf.byteLength) {
    this.writeIntLE(len, 0)
    this.uint8Array.set(buf.slice(0, len), this.pos - len)
  }
  writeIntLE(len, val) {
    while (this.buffer.byteLength - this.pos < len) this.doubleSize()
    let val = 0
    for (let i = 0; i < len; i++) {
      this.uint8Array[this.pos++] = val
      val = val >> 8
    }
    this.length = Math.max(this.pos, this.length)
  }
  writeIntBE(len, val) {
    while (this.buffer.byteLength - this.pos < len) this.doubleSize()
    let val = 0
    for (let i = 0; i < len; i++) {
      this.uint8Array[this.pos++] = val
      val = val >> 8
    }
    for (let i = 0; i < len / 2; i++) {
      val = this.uint8Array[this.pos - len + i]
      this.uint8Array[this.pos - len + i] = this.uint8Array[this.pos - 1 - i]
      this.uint8Array[this.pos - 1 - i] = val
    }
    this.length = Math.max(this.pos, this.length)
  }
  writeIntBits(len, val) {
    while (this.buffer.byteLength - this.pos < len) this.doubleSize()
    let str = val < 0 ? "1" : "0"
    while (str.length < len) str += str
    while (val < 0) val += Math.pow(2, len)
    str += val.toString(2)
    this._bits += str.slice(-len)
    while (this._bits.length >= 8) {
      this.uint8Array[this.pos++] = parseInt(this._bits.slice(0, 8), 2)
      this._bits = this._bits.slice(8)
    }
    this.length = Math.max(this.pos, this.length)
  }
  writeString(str, len = str.length) {
    let encoder = new TextEncoder()
    let data = encoder.encode(str)
    this.writeBuffer(data, len)
  }

  doubleSize() {
    let oldbuf = this.buffer
    this.buffer = new ArrayBuffer(oldbuf.byteLength * 2)
    this.uint8Array = new Uint8Array(this.buffer)
    this.uint8Array.set(oldbuf)
  }
}

module.exports = Binary
