const
  Binary = require("../utils/bin"),
  Wave = require("../utils/wav"),
  modinfo = require("../utils/mod")

function load_mod(buf) {
  let music = {
    format: "mod",
    title: "Untitled",
    samples: [],
    tables: [],
  }
  let bin = new Binary()
  bin.fromBuffer(buf)
  bin.jumpTo(1080)
  music.magic = bin.readString(4)
  bin.jumpTo(0)

  let sampleCount = 15
  music.channelCount = 4
  console.log("mod", music.magic)
  if ("\nM.K.\nFLT4\nFLT8\nM!K!\n4CHN\n6CHN\n8CHN\n".includes("\n" + music.magic + "\n")) {
    sampleCount = 31
    if (music.magic.includes("6")) music.channelCount = 6
    if (music.magic.includes("8")) music.channelCount = 8
  }

  music.title = bin.readString(20)
  console.log("Title:", music.title)

  // Sampleinfo!
  for (let i = 0; i < sampleCount; i++) {
    let sample = {}
    sample.name = bin.readString(22)
    sample.length = bin.readUIntBE(2) * 2
    sample.finetune = bin.readUIntBE(1)
    sample.volume = bin.readUIntBE(1) / 64
    sample.loopStart = bin.readUIntBE(2)
    sample.loopLength = bin.readUIntBE(2)
    if (sampleCount > 15) {
      sample.loopStart *= 2
      sample.loopLength *= 2
    }

    if (sample.name.trim()) console.log(sample.name)
    music.samples[i] = sample
  }

  // Sequence!
  let sequenceLength = bin.readUIntBE(1)
  music.restartPosition = bin.readUIntBE(1)
  music.sequence = []
  for (let i = 0; i < 128; i++) {
    music.sequence.push(bin.readUIntBE(1) + 1)
  }
  if (sampleCount > 15)
    music.magic = bin.readString(4)

  // Tables!
  let tableCount = music.sequence.reduce((a, b) => a > b ? a : b)
  music.sequence.length = sequenceLength
  for (let i = 0; i < tableCount; i++) {
    let table = []
    for (let div = 0; div < 64; div++) {
      let division = []
      for (let chan = 0; chan < music.channelCount; chan++) {
        let channel = {}
        channel.sample = bin.readUIntBits(4) * 16
        channel.period = bin.readUIntBits(12)
        channel.sample += bin.readUIntBits(4)
        channel.fx = bin.readUIntBits(12)

        channel.semitone = modinfo.periodToSemitone(channel.period)
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
    music.tables[i] = table
  }

  // Samples!
  for (let i = 0; i < sampleCount; i++) {
    let sample = music.samples[i]
    if (sample.length >= 2) {
      bin.skip(2)
      sample.length += -2
      sample.wave = new Wave()
      sample.wave.reset(1, 8, 16000)
      for (let j = 0; j < sample.length; j++) {
        sample.wave.writeSInt8(bin.readSIntBE(1))
      }
    } else {
      sample.wave = bin.skip(sample.length)
    }
  }

  if (!bin.isEOF())
    console.warn(bin.length - bin.pos, "bytes left unread!")
  return music
}

module.exports = load_mod
