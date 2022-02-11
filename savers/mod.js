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
    if (sample.wave) bin.writeIntBE(2, Math.ceil((sample.wave?.getSampleLength() || 0) / 2) + 1)
    else bin.writeIntBE(2, 0)
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
        channel.period = modinfo.semitoneToPeriod(channel.semitone) || 0
        bin.writeIntBits(4, Math.floor((channel.sample || 0) / 16))
        bin.writeIntBits(12, channel.period || 0)
        bin.writeIntBits(4, channel.sample || 0)
        bin.writeIntBits(12, channel.fx || 0)
      }
    }
  }

  // Samples!
  for (let i = 0; i < 31; i++) {
    let sample = music.samples[i] || {}
    if (sample.wave) {
      bin.writeIntBE(2, 0)
      sample.wave.data.jumpTo(0)
      let len = Math.ceil(sample.wave.getSampleLength() / 2) * 2
      for (let j = 0; j < len; j++) {
        bin.writeIntBE(1, sample.wave.readSInt8())
      }
    }
  }

  return new Uint8Array(bin.toBuffer())
}

module.exports = save_mod
