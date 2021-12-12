let file
let filepos = 0

function save_wav(data) {
  file = new Uint8Array(44 + data.length)
  filepos = 0
  writeText("RIFF")
  writeUInt32_Littleend(36 + data.length)
  writeText("WAVE")

  writeText("fmt ")
  writeUInt32_Littleend(16)
  writeUInt16_Littleend(1)
  writeUInt16_Littleend(1)
  writeUInt32_Littleend(44100)
  writeUInt32_Littleend(44100 * 1 * 2)
  writeUInt16_Littleend(1 * 2)
  writeUInt16_Littleend(16)

  writeText("data")
  writeUInt32_Littleend(data.length)
  file.set(data, filepos)
  filepos += data.length
  return file
}

function writeText(text = "") {
  let encoder = new TextEncoder
  let data = encoder.encode(text)
  file.set(data, filepos)
  filepos += data.length
}

function writeUInt32_Littleend(int) {
  let data = new Uint8Array(4)
  for (let i = 0; i < data.length; i++) {
    data[i] = int % 256
    int = Math.floor(int / 256)
  }
  file.set(data, filepos)
  filepos += data.length
}
function writeUInt16_Littleend(int) {
  let data = new Uint8Array(2)
  for (let i = 0; i < data.length; i++) {
    data[i] = int % 256
    int = Math.floor(int / 256)
  }
  file.set(data, filepos)
  filepos += data.length
}


module.exports = save_wav