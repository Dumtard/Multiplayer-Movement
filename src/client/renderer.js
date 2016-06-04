let PIXI = window.PIXI

PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST

let renderer = PIXI.autoDetectRenderer(window.innerWidth,
                                       window.innerHeight,
                                       { backgroundColor: 0x000000 })
document.getElementById('game').appendChild(renderer.view)

window.addEventListener('resize', () => {
  renderer.resize(window.innerWidth, window.innerHeight)
})

/**
 * Container
 * @type PIXI.Container
 */
let stage = new PIXI.Container()
stage.scale.set(2, 2)

/**
 * Class to wrap around PIXI renderer and a stage
 * @class Renderer
 */
class Renderer {
  /**
   * Add a child to the scene graph to be rendered
   * @param {PIXI.DisplayObject} child - The child DisplayObject to add to
   * the scene graph
   */
  add (child) {
    stage.addChild(child)
  }

  /**
   * Remove a child from the scene graph
   * @param {PIXI.DisplayObject} child - The child DisplayObject to add to
   * the scene graph
   */
  remove (child) {
    stage.removeChild(child)
  }

  /**
   * Render the current scene graph
   */
  render () {
    renderer.render(stage)
  }
}

module.exports = new Renderer()
