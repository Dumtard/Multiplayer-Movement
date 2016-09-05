let System = require('./system')

/**
 * Class for handling the world bounds for entities
 * @class WorldBoundsSystem
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
    if (entity.position.y > 200) {
      entity.velocity.y = 0
      entity.position.y = 200
    } else if (entity.position.y < 0) {
      entity.velocity.y = 0
      entity.position.y = 0
    }

    if (entity.position.x + 48 > 420) {
      if (entity.input) {
        entity.velocity.x = 0
      } else {
        entity.velocity.x *= -1
      }
      entity.position.x = 420 - 48
    } else if (entity.position.x < 0) {
      if (entity.input) {
        entity.velocity.x = 0
      } else {
        entity.velocity.x *= -1
      }
      entity.position.x = 0
    }
  }
}

module.exports = new WorldBoundsSystem()
