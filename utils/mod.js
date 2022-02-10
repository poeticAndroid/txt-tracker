const mod_periods = [false,
  1712, 1616, 1525, 1440, 1357, 1281, 1209, 1141, 1077, 1017, 961, 907,
  856, 808, 762, 720, 678, 640, 604, 570, 538, 508, 480, 453,
  428, 404, 381, 360, 339, 320, 302, 285, 269, 254, 240, 226,
  214, 202, 190, 180, 170, 160, 151, 143, 135, 127, 120, 113,
  107, 101, 95, 90, 85, 80, 76, 71, 67, 64, 60, 57]

module.exports = {
  periodToSemitone(period) {
    let best = 0
    for (let i = 0; i < mod_periods.length; i++) {
      if (Math.abs(mod_periods[best] - period) > Math.abs(mod_periods[i] - period)) {
        best = i
      }
    }
    return best
  },
  semitoneToPeriod(semitone) {
    return mod_periods[semitone]
  }
}