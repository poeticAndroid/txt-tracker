const process = require("process"),
  fs = require("fs")

let file, filepos = 0,
  music = {
    title: "Untitled",
    samples: [],
  }

function init(filename) {
  console.log("Loading file", filename)
  file = fs.readFileSync(filename)
  filepos = 0
  load_mod()
}

function load_mod() {
  filepos = 1080
  music.magic = readText(4)
  filepos = 0
  let sampleCount = 15
  if ("\nM.K.\nFLT4\nFLT8\nM!K!\n4CHN\n6CHN\n8CHN\n".includes("\n" + music.magic.toUpperCase() + "\n")) sampleCount = 31

  music.title = readText(20)
  console.log("Title:", music.title)
  music.samples = []
  for (let i = 0; i < sampleCount; i++) {
    let sample = {
      name: readText(22),
      byteLength: readUInt_Bigend(2) * 2,
      finetune: readUInt_Bigend(1),
      volume: readUInt_Bigend(1),
      loopStart: readUInt_Bigend(2),
      loopLength: readUInt_Bigend(2),
    }
    if (sampleCount > 15) {
      sample.loopStart *= 2
      sample.loopLength *= 2
    }
    music.samples[i] = sample
    if (sample.name) console.log(sample.name)
  }
  music.sequenceLength = readUInt_Bigend(1)
  music.restartPosition = readUInt_Bigend(1)
  music.sequence = readBytes(128).slice(0, music.sequenceLength).map(n => n + 1)
  if (sampleCount > 15)
    music.magic = readText(4)

  music.tables = []
  let tableCount = music.sequence.reduce((a, b) => a > b ? a : b)
  for (let i = 0; i < tableCount; i++) {
    music.tables[i] = {}
    music.tables[i].data = readBytes(1024)
  }

  for (let i = 0; i < sampleCount; i++) {
    if (music.samples[i].byteLength >= 2) {
      music.samples[i].data = readBytes(2)
      music.samples[i].data = readBytes(music.samples[i].byteLength - 2)
    } else {
      music.samples[i].data = readBytes(music.samples[i].byteLength)
    }
  }
  console.log(music)
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

function readUInt_Bigend(len = 1) {
  let data = readBytes(len)
  let int = 0
  for (let i = 0; i < len; i++) {
    int *= 256
    int += data[i]
  }
  return int
}

init(process.argv[process.argv.length - 1])
