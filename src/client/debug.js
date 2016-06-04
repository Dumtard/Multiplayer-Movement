let PIXI = window.PIXI

// let renderer = require('./renderer')

let debugText = new PIXI.Text(`Frame Time: --ms
       FPS: --.--`, { font: '16px Monospace', fill: 'white' })
debugText.x = 10
debugText.y = 10
debugText.visible = true

// renderer.add(debugText)

document.addEventListener('keydown', (event) => {
  if (event.keyCode === 192) {
    debugText.visible = !debugText.visible
  }
})

class Debug {
  constructor () {
    setInterval(() => {
      // debugText.text = `Frame Time: ${(delta * 1000).toFixed(0)}ms
      //  FPS: ${(1 / delta).toFixed(2)}`
    }, 250)
  }
}

module.exports = window.debug = new Debug()
