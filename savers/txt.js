const fs = require("fs"),
  save_wav = require("./wav")

let file = ""

function save_txt(music, path = "./") {
  file = "# Tracker source\n\n"
  for (let i = 0; i < music.samples.length; i++) {
    if (music.samples[i]?.name.substring(0, 1) === "#")
      writeLine(music.samples[i]?.name)
  }
  writeLine()
  writeLine("title: " + music.title)
  writeLine("channelCount: " + music.channels)
  writeLine("sequence: " + music.sequence.join(" "))
  writeLine()
  for (let i = 0; i < music.samples.length; i++) {
    if (music.samples[i].byteLength) {
      let filename = music.title.trim() + "_samples/"
      fs.mkdirSync(path + filename, { recursive: true })
      filename += "sample" + ("000" + i).slice(-3) + ".wav"
      fs.writeFileSync(path + filename, save_wav(music.samples[i].pcm))
      writeSample(music.samples[i], i + 1, filename)
    }
  }
  for (let i = 0; i < music.tables.length; i++) {
    writeTable(music.tables[i], i + 1)
  }
  return file
}

function writeSample(sample, i, filename = "./sample.wav") {
  writeLine("sample " + i + ":")
  writeLine("name: " + sample.name)
  writeLine("source: " + filename)
  writeLine("finetune: " + sample.finetune)
  writeLine("volume: " + sample.volume)
  writeLine("loopStart: " + sample.loopStart)
  writeLine("loopLength: " + sample.loopLength)
  writeLine()
}

function writeTable(table, i) {
  writeLine("table " + i + ":")
  for (let i = 0; i < table.length; i++) {
    let div = table[i]
    let line = ""
    for (let j = 0; j < div.length; j++) {
      let chan = div[j]
      if (chan.sample) {
        line += notes[chan.semitone] || ("0000" + chan.semitone).slice(-3)
        line += ("    " + chan.sample.toString(16)).slice(-2)
      } else {
        line += "     "
      }
      line += ("    " + (chan.fx ? chan.fx : "").toString(16)).slice(-4)
      // line += ("   " + chan.effect.id.toString(16)).slice(-2)
      // line += ("   " + chan.effect.x.toString(16)).slice(-1)
      // line += ("   " + chan.effect.y.toString(16)).slice(-1)
      line += "|"
    }
    writeLine(line)
  }
  writeLine()
}

function writeLine(line = "") {
  file += line + "\n"
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