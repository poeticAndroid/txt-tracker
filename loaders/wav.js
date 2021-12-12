let file
let filepos = 0

function load_wav(data, bytesPerSampleOut = 2) {
  file = data
  filepos = 0
  if (readText(4) !== "RIFF") return console.error("Unsupported sample format!")
  let len = readUInt_Littleend(4)
  if (readText(4) !== "WAVE") return console.error("Unsupported sample format!")

  if (readText(4) !== "fmt ") return console.error("Unsupported sample format!")
  if (readUInt_Littleend(4) !== 16) return console.error("Unsupported sample format!")
  if (readUInt_Littleend(2) !== 1) return console.error("Unsupported sample format!")
  let channelCount = readUInt_Littleend(2)
  let sampleRate = readUInt_Littleend(4)
  let byteRate = readUInt_Littleend(4)
  let blockAlign = readUInt_Littleend(2)
  let bitsPerSample = readUInt_Littleend(2)
  let bytesPerSampleIn = blockAlign

  if (readText(4) !== "data") return console.error("Unsupported sample format!")
  len = readUInt_Littleend(4)
  let pcm = new Uint8Array((len / bytesPerSampleIn) * bytesPerSampleOut)
  let a = bitsPerSample < 10 ? 128 : 0
  for (let i = 0; i < pcm.length; i += bytesPerSampleOut) {
    if (bytesPerSampleIn > bytesPerSampleOut)
      readUInt_Littleend(bytesPerSampleIn - bytesPerSampleOut)
    let rest = Math.min(bytesPerSampleIn, bytesPerSampleOut)
    let j = 0
    while (rest--)
      pcm[i + (j++)] = readUInt_Littleend(1) + a
    if (bytesPerSampleIn < bytesPerSampleOut) {
      rest = bytesPerSampleOut - bytesPerSampleIn
      while (rest--) {
        pcm[i + j] = pcm[i + j - bytesPerSampleIn]
        j++
      }
    }
  }

  return pcm
}

function readBytes(len = 1) {
  let data = new Uint8Array(len)
  let i = 0
  while (i < len) {
    data[i++] = file[filepos++]
  }
  return data
}

function readText(len = 1) {
  let data = readBytes(len)
  let decoder = new TextDecoder()
  let text = decoder.decode(data)
  if (text.includes("\x00")) text = text.substring(0, text.indexOf("\00"))
  return text
}

function readUInt_Littleend(len = 1) {
  let data = readBytes(len)
  let int = 0
  for (let i = len - 1; i >= 0; i--) {
    int *= 256
    int += data[i]
  }
  return int
}

module.exports = load_wav