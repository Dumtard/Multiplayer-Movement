let System = require('./system')

/**
 * Class for handling the world bounds for entities
 * @class
 * @extends System
 */
class WorldBoundsSystem extends System {
  /**
   * Create the World Bounds System with the correct component requirements.
   * @constructor
   */
  constructor () {
    super(['position', 'velocity'])
  }

  /**
   * Handle the system call
   * @param {Number} delta - The frame time
   * @param {Entity} entity - The entity to apply the bounds to
   */
  handle (delta, entity) {
    if (entity.position.y + 64 > window.innerHeight / 2) {
      entity.velocity.y = 0
      entity.position.y = window.innerHeight / 2 - 64
    } else if (entity.position.y < 0) {
      entity.velocity.y = 0
      entity.position.y = 0
    }

    if (entity.position.x + 48 > window.innerWidth / 2) {
      entity.velocity.x = 0
      entity.position.x = window.innerWidth / 2 - 48
    } else if (entity.position.x < 0) {
      entity.velocity.x = 0
      entity.position.x = 0
    }
  }
}

module.exports = new WorldBoundsSystem()
