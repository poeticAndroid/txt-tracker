let file, filepos = 0,
  music = {
    title: "Untitled",
    samples: [],
    tables: [],
  }

function load_mod(_file) {
  file = _file
  filepos = 1080
  music.magic = readText(4)
  filepos = 0
  let sampleCount = 15
  if ("\nM.K.\nFLT4\nFLT8\nM!K!\n4CHN\n6CHN\n8CHN\n".includes("\n" + music.magic + "\n")) sampleCount = 31

  music.channelCount = 4

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
    music.tables[i] = read_mod_table()
  }

  for (let i = 0; i < sampleCount; i++) {
    if (music.samples[i].byteLength >= 2) {
      music.samples[i].pcm = readBytes(2)
      music.samples[i].pcm = pcm8to16(readBytes(music.samples[i].byteLength - 2))
    } else {
      music.samples[i].pcm = readBytes(music.samples[i].byteLength)
    }
  }
  if (filepos !== file.length)
    console.log(file.length - filepos, "bytes left to read!")
  return music
}

function read_mod_table() {
  let table = []
  for (let div = 0; div < 64; div++) {
    let division = []
    for (let chan = 0; chan < music.channelCount; chan++) {
      let channel = {}
      let data = readBytes(4)
      channel.sample = (data[0] & 240) + Math.floor(data[2] / 16)
      channel.period = (data[0] & 15) * 256 + data[1]
      channel.fx = (data[2] & 15) * 256 + data[3]
      channel.semitone = periodToSemitone(channel.period)
      channel.effect = {}
      channel.effect.id = Math.floor(channel.fx / 256) % 16
      channel.effect.x = Math.floor(channel.fx / 16) % 16
      channel.effect.y = Math.floor(channel.fx / 1) % 16
      if (channel.effect.id == 14) {
        channel.effect.id = 1400 + channel.effect.x
        channel.effect.x = channel.effect.y
      }
      division.push(channel)
    }
    table.push(division)
  }
  return table
}

function periodToSemitone(period) {
  let dev = 0
  while (dev < 4096) {
    if (mod_periods["" + (period - dev)]) {
      return mod_periods["" + (period - dev)]
    }
    if (mod_periods["" + (period + dev)]) {
      return mod_periods["" + (period + dev)]
    }
    dev = dev + 1
  }
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

function pcm8to16(data) {
  let pcm = new Uint8Array(data.length * 2)
  for (let i = 0; i < pcm.length; i++) {
    pcm[i] = data[Math.floor(i / 2)]
  }
  return pcm
}

const mod_periods = {
  "1712": 1,
  "1616": 2,
  "1525": 3,
  "1440": 4,
  "1357": 5,
  "1281": 6,
  "1209": 7,
  "1141": 8,
  "1077": 9,
  "1017": 10,
  "961": 11,
  "907": 12,
  "856": 13,
  "808": 14,
  "762": 15,
  "720": 16,
  "678": 17,
  "640": 18,
  "604": 19,
  "570": 20,
  "538": 21,
  "508": 22,
  "480": 23,
  "453": 24,
  "428": 25,
  "404": 26,
  "381": 27,
  "360": 28,
  "339": 29,
  "320": 30,
  "302": 31,
  "285": 32,
  "269": 33,
  "254": 34,
  "240": 35,
  "226": 36,
  "214": 37,
  "202": 38,
  "190": 39,
  "180": 40,
  "170": 41,
  "160": 42,
  "151": 43,
  "143": 44,
  "135": 45,
  "127": 46,
  "120": 47,
  "113": 48,
  "107": 49,
  "101": 50,
  "95": 51,
  "90": 52,
  "85": 53,
  "80": 54,
  "76": 55,
  "71": 56,
  "67": 57,
  "64": 58,
  "60": 59,
  "57": 60
}

module.exports = load_mod
