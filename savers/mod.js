const
  Binary = require("../utils/bin"),
  Wave = require("../utils/wav"),
  modinfo = require("../utils/mod")

function save_mod(music) {
  let bin = new Binary()
  bin.writeString(music.title, 20)

  // Sampleinfo!
  for (let i = 0; i < 31; i++) {
    let sample = music.samples[i] || {}
    bin.writeString(sample.name || "", 22)
    bin.writeIntBE(2, (sample.length || 0) / 2 + 1)
    bin.writeIntBE(1, sample.finetune || 0)
    bin.writeIntBE(1, Math.round((sample.volume || 0) * 64))
    bin.writeIntBE(2, (sample.loopStart || 0) / 2)
    bin.writeIntBE(2, (sample.loopLength || 0) / 2)
  }

  // Sequence!
  let tableCount = music.sequence.reduce((a, b) => a > b ? a : b)
  bin.writeIntBE(1, music.sequenceLength || music.sequence.length)
  bin.writeIntBE(1, 127)
  for (let i = 0; i < 128; i++) {
    bin.writeIntBE(1, music.sequence[i] - 1)
  }
  if (music.channelCount !== 4) bin.writeString(music.channelCount + "CHN", 4)
  else bin.writeString(tableCount > 64 ? "M!K!" : "M.K.", 4)

  // Tables!
  for (let i = 0; i < tableCount; i++) {
    let table = music.tables[i] || []
    for (let div = 0; div < 64; div++) {
      let division = table[div] || []
      for (let chan = 0; chan < music.channelCount; chan++) {
        let channel = division[chan] || {}
        channel.period = modinfo.semitoneToPeriod(channel.semitone)
        bin.writeIntBits(4, Math.floor(channel.sample / 16))
        bin.writeIntBits(12, channel.period)
        bin.writeIntBits(4, channel.sample)
        bin.writeIntBits(12, channel.fx)
      }
    }
  }

  // Samples!
  for (let i = 0; i < 31; i++) {
    let sample = music.samples[i] || {}
    bin.writeIntBE(2, 0)
    if (sample.wave) {
      sample.wave.data.jumpTo(0)
      for (let j = 0; j < sample.length; j++) {
        bin.writeIntBE(1, sample.wave.readSInt8())
      }
    }
  }

  return new Uint8Array(bin.toBuffer())
}

module.exports = save_mod
