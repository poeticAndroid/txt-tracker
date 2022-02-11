const
  fs = require("fs"),
  Wave = require("../utils/wav")

let file, filepos = 0,
  music

function load_txt(_file, path = "./") {
  music = {
    title: "Untitled",
    channelCount: 4,
    sequence: [1],
    samples: [],
    tables: [],
  }
  file = "" + _file + "\n\n"
  filepos = 0

  while (filepos < file.length) {
    let line = readLine().trim()
    if (line.substring(0, 1) === "#") {
      // comment
    } else if (line === "") {
      // blank line
    } else if (line.includes(":")) {
      // field
      let i
      let parts = line.split(":")
      let field = parts[0].trim().split(/\s+/)
      let value = line.substring(line.indexOf(":") + 1).trim()
      switch (field[0]) {
        case "version":
          music.version = parseInt(value)
          if (music.version > 1) console.warn("This txt loader only supports version 1 or older!")
          break
        case "format":
          music.format = value.toLowerCase()
          break
        case "title":
          music.title = value
          break
        case "channelCount":
          music.channelCount = parseInt(value)
          break
        case "sequence":
          music.sequence = value.split(/\s+/).map(n => parseInt(n))
          break
        case "table":
          i = field[1]
          music.tables[i - 1] = readTable()
          break
        case "sample":
          i = field[1]
          music.samples[i - 1] = readSample(path)
          break

        default:
          console.warn("Unknown field", field[0])
          break
      }
    }
  }


  return music
}

function readLine() {
  let line = ""
  let i = file.indexOf("\n", filepos)
  if (i >= 0) {
    line = file.substring(filepos, i)
    filepos = i + 1
  } else {
    line = file.substring(filepos)
    filepos = i
  }
  return line
}

function readTable() {
  let table = []
  let line = readLine().trim()
  while (line && (filepos < file.length)) {
    if (line.substring(0, 1) === "#") {
      // comment
    } else if (line.includes("|")) {
      // division
      let division = []
      let div = line.split("|")
      for (let i = 0; i < music.channelCount; i++) {
        let channel = {}
        let chan = div[i].trim().split(".")
        channel.note = chan[0].trim().toUpperCase()
        channel.semitone = notes.indexOf(channel.note)
        channel.sample = parseInt(chan[1].trim())
        channel.fx = parseInt(chan[2].trim(), 16)
        channel.effect = {}
        channel.effect.id = Math.floor(channel.fx / 256) % 16
        channel.effect.x = Math.floor(channel.fx / 16) % 16
        channel.effect.y = Math.floor(channel.fx / 1) % 16
        division.push(channel)
      }
      table.push(division)
    }
    line = readLine().trim()
  }
  return table
}

function readSample(path = "./") {
  let sample = {}
  let line = readLine().trim()
  while (line && (filepos < file.length)) {
    if (line.substring(0, 1) === "#") {
      // comment
    } else if (line.includes(":")) {
      // field
      let parts = line.split(":")
      let field = parts[0].trim().split(/\s+/)
      let value = line.substring(line.indexOf(":") + 1).trim()
      switch (field[0]) {
        case "name":
          sample.name = value
          break
        case "volume":
          sample.volume = parseFloat(value)
          if (sample.volume > 1) sample.volume /= 64
          break
        case "loopStart":
          sample.loopStart = parseInt(value)
          break
        case "loopLength":
          sample.loopLength = parseInt(value)
          break
        case "finetune":
          sample.finetune = parseInt(value)
          break
        case "source":
          let data = fs.readFileSync(path + value)
          sample.wave = new Wave()
          sample.wave.fromBuffer(data)
          break

        default:
          console.warn("Unknown sample field", field[0])
          break
      }
    }
    line = readLine().trim()
  }
  return sample
}

const notes = [
  // "C-1", "C#1", "D-1", "D#1", "E-1", "F-1", "F#1", "G-1", "G#1", "A-1", "A#1",
  "B-1",
  "C-2", "C#2", "D-2", "D#2", "E-2", "F-2", "F#2", "G-2", "G#2", "A-2", "A#2", "B-2",
  "C-3", "C#3", "D-3", "D#3", "E-3", "F-3", "F#3", "G-3", "G#3", "A-3", "A#3", "B-3",
  "C-4", "C#4", "D-4", "D#4", "E-4", "F-4", "F#4", "G-4", "G#4", "A-4", "A#4", "B-4",
  "C-5", "C#5", "D-5", "D#5", "E-5", "F-5", "F#5", "G-5", "G#5", "A-5", "A#5", "B-5",
  "C-6", "C#6", "D-6", "D#6", "E-6", "F-6", "F#6", "G-6", "G#6", "A-6", "A#6", "B-6",
  "C-7", "C#7", "D-7", "D#7", "E-7", "F-7", "F#7", "G-7", "G#7", "A-7", "A#7", "B-7",
  "C-8", "C#8", "D-8", "D#8", "E-8", "F-8", "F#8", "G-8", "G#8", "A-8", "A#8", "B-8",
  "C-9", "C#9", "D-9", "D#9", "E-9", "F-9", "F#9", "G-9", "G#9", "A-9", "A#9", "B-9",
]

module.exports = load_txt