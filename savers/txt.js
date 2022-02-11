const
  fs = require("fs")

let file = ""

function save_txt(music, path = "./", sampleFolder) {
  file = "# Music tracker source file\n"
  writeLine("version: " + 1)
  writeLine("format: " + music.format)
  writeLine()
  writeLine("title: " + music.title)
  for (let i = 0; i < music.samples.length; i++) {
    if (music.samples[i]?.name.substring(0, 1) === "#")
      writeLine(music.samples[i]?.name)
  }
  writeLine("channelCount: " + music.channelCount)
  writeLine("sequence: " + music.sequence.join(" "))
  // if (music.restartPosition)
  //   writeLine("restartPosition: " + music.restartPosition)
  writeLine()
  let friendlyTitle = friendlyName(music.title || "mod")
  if (!sampleFolder) sampleFolder = friendlyTitle + "_samples/"
  writeLine("\n# ---=== TABLES ===---\n")
  for (let i = 0; i < music.tables.length; i++) {
    writeTable(music.tables[i], i + 1)
  }
  writeLine("\n# ---=== SAMPLES ===---\n")
  for (let i = 0; i < music.samples.length; i++) {
    if (music.samples[i]) {
      let filename = sampleFolder
      if (music.samples[i].wave) {
        fs.mkdirSync(path + filename, { recursive: true })
        filename += ("00" + (i + 1)).slice(-2) + "." + friendlyName(music.samples[i].name.trim() || "sample") + ".wav"
        fs.writeFileSync(path + filename, new Uint8Array(music.samples[i].wave.toBuffer()))
      }
      writeSample(music.samples[i], i + 1, filename)
    }
  }
  return file
}

function writeSample(sample, i, filename = "./sample.wav") {
  writeLine("sample " + i + ":")
  writeLine("name: " + sample.name)
  if (sample.wave) {
    writeLine("source: " + filename)
    writeLine("volume: " + sample.volume)
    writeLine("loopStart: " + sample.loopStart)
    writeLine("loopLength: " + sample.loopLength)
  }
  if (sample.finetune)
    writeLine("finetune: " + sample.finetune)
  writeLine()
}

function writeTable(table, i) {
  writeLine("table " + i + ":")
  for (let i = 0; i < table.length; i++) {
    let div = table[i]
    let line = ""
    for (let j = 0; j < div.length; j++) {
      let chan = div[j]
      if (chan.period || chan.note)
        line += notes[chan.semitone] || ("   " + chan.period.toString(16)).slice(-3)
      else
        line += "   "
      line += "."
      if (chan.sample)
        line += ("  " + chan.sample).slice(-2)
      else
        line += "  "
      line += "."
      if (chan.fx)
        line += ("     " + chan.fx.toString(16)).slice(-5)
      else
        line += "     "
      line += "|"
    }
    writeLine(line)
  }
  writeLine()
}

function writeLine(line = "") {
  file += line + "\n"
}

function friendlyName(name) {
  name = name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9\_]/g, '-')
  return name
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

module.exports = save_txt