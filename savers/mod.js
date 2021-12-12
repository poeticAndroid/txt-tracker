let file, filepos = 0,
  music = {
    title: "Untitled",
    samples: [],
    tables: [],
  }

function save_mod(_music) {
  music = _music
  file = new Uint8Array(1024 * 1024)
  filepos = 0

  writeText(music.title, 20)
  for (let i = 0; i < 31; i++) {
    let sample = music.samples[i] || {}
    writeText(sample.name || "", 22)
    let len = Math.floor((sample.pcm?.length || 0) / 4)
    if (len) len++
    writeUInt_Bigend(len, 2)
    writeUInt_Bigend((sample.finetune || 0), 1)
    writeUInt_Bigend((sample.volume || 0), 1)
    writeUInt_Bigend((sample.loopStart || 0) / 2, 2)
    writeUInt_Bigend((sample.loopLength || 0) / 2, 2)
  }

  let tableCount = music.sequence.reduce((a, b) => a > b ? a : b)
  writeUInt_Bigend(music.sequence.length, 1)
  writeUInt_Bigend(127, 1)
  writeBytes(music.sequence.map(n => n - 1), 128)
  if (music.channelCount !== 4) writeText(music.channelCount + "CHN", 4)
  else writeText(tableCount > 64 ? "M!K!" : "M.K.", 4)
  for (let i = 0; i < tableCount; i++) {
    let table = music.tables[i]
    write_mod_table(table)
  }

  for (let i = 0; i < 31; i++) {
    let sample = music.samples[i] || {}
    let len = Math.floor((sample.pcm?.length || 0) / 4)
    if (len) writeUInt_Bigend(0, 2)
    writeBytes(pcm16to8(sample.pcm || []), len * 2)
  }


  return file = trimSize(file, filepos)
}

function write_mod_table(table) {
  for (let div = 0; div < 64; div++) {
    let division = table[div] || []
    for (let chan = 0; chan < music.channelCount; chan++) {
      let channel = division[chan] || {}
      let data = 0
      channel.period = channel.period || semitoneToPeriod(channel.semitone)
      data += Math.floor((channel.sample || 0) / 16)
      data *= 4096
      data += channel.period || 0
      data *= 16
      data += (channel.sample || 0) % 16
      data *= 4096
      data += channel.fx || 0
      writeUInt_Bigend(data, 4)
    }
  }
}

function semitoneToPeriod(semitone) {
  return mod_periods[semitone]
}

function writeBytes(data, len = data.length) {
  if (filepos + data.length > file.length) file = doubleSize(file)
  let i = 0
  while (i < len) {
    file[filepos++] = data[i++] || 0
  }
}

function writeText(text, len = text.length) {
  let encoder = new TextEncoder()
  let data = encoder.encode(text)
  writeBytes(data, len)
}

function writeUInt_Bigend(int, len) {
  let data = new Uint8Array(len)
  for (let i = len - 1; i >= 0; i--) {
    data[i] = int % 256
    int = Math.floor(int / 256)
  }
  writeBytes(data)
}

function pcm16to8(data) {
  let pcm = new Uint8Array(data.length / 2)
  for (let i = 0; i < pcm.length; i++) {
    pcm[i] = data[Math.floor(i * 2) + 1]
  }
  return pcm
}

function doubleSize(oldArr) {
  let newArr = new Uint8Array(oldArr.length * 2)
  newArr.set(oldArr)
  return newArr
}
function trimSize(oldArr, size = filepos) {
  return oldArr.slice(0, size)
}

const mod_periods = [false,
  1712, 1616, 1525, 1440, 1357, 1281, 1209, 1141, 1077, 1017, 961, 907,
  856, 808, 762, 720, 678, 640, 604, 570, 538, 508, 480, 453,
  428, 404, 381, 360, 339, 320, 302, 285, 269, 254, 240, 226,
  214, 202, 190, 180, 170, 160, 151, 143, 135, 127, 120, 113,
  107, 101, 95, 90, 85, 80, 76, 71, 67, 64, 60, 57]

module.exports = save_mod
