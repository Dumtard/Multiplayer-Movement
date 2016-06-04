let System = require('./system')

/**
 * Class for handling gravity on entities
 * @class
 * @extends System
 */
class GravitySystem extends System {
  /**
   * Create the Gravity System with the correct component requirements.
   * @constructor
   */
  constructor () {
    super(['gravity', 'velocity'])
  }

  /**
   * Handle the system call
   * @param {Number} delta - The frame time
   * @param {Entity} entity - The entity to apply gravity to
   */
  handle (delta, entity) {
    entity.velocity.y += entity.gravity.y * delta
    entity.velocity.x += entity.gravity.x * delta
  }
}

module.exports = new GravitySystem()
