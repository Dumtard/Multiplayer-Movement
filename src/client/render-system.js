let System = require('./system')

/**
 * Renderer
 * @type {Renderer}
 */
let renderer = require('./renderer')

/**
 * Class for handling rendering of entities
 * @class RenderSystem
 * @extends System
 */
class RenderSystem extends System {
  /**
   * Create the Render System with the correct component requirements.
   * @constructor
   */
  constructor () {
    super(['position', 'sprite'])
  }

  /**
   * Handle entities being added to the system
   * @param {Entity} entity - The entity being added
   */
  add (entity) {
    super.add(entity)
    renderer.add(entity.sprite)
  }

  /**
   * Handle entities being removed from the system
   * @param {Number} index - The index of the entity being removed
   * @param {Entity} entity - The entity being removed
   */
  remove (index, entity) {
    super.remove(index, entity)
    renderer.remove(entity.sprite)
  }

  /**
   * Handle the system call
   * @param {Number} delta - The frame time
   * @param {Entity} entity - The entity to render
   */
  handle (delta, entity, [percent]) {
    let position = entity.position
    let sprite = entity.sprite

    // let diff = {
    //   x: position.x - position.previous.x,
    //   y: position.y - position.previous.y
    // }

    // entity.sprite.position.x = position.previous.x + (diff.x * percent)
    // entity.sprite.position.y = position.previous.y + (diff.y * percent)
    sprite.position.x = position.x
    sprite.position.y = position.y
  }

  /**
   * Handle the end of system call
   */
  end () {
    renderer.render()
  }
}

module.exports = window.system = new RenderSystem()
