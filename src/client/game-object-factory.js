/**
 * EntityManager
 * @type {EntityManager}
 */
let EntityManager = require('./entity-manager')

let PIXI
if (typeof window !== 'undefined') {
  PIXI = window.PIXI
}

/**
 * Class to generate Entities with the appropriate components
 * @class GameObjectFactory
 */
class GameObjectFactory {
  /**
   * Create a player entity
   * @static
   * @return {Entity} Player Entity
   */
  static createPlayer () {
    let entity = EntityManager.createEntity()

    if (typeof window !== 'undefined') {
      let sprite = PIXI.Sprite.fromImage('resources/square.png')
      sprite.tint = Math.random() * 0xFFFFFF
      sprite.scale.set(0.48, 0.64)

      entity.sprite = sprite
      window.entity = entity
    }

    entity.inputs = []
    entity.position = {x: 0, y: 100}
    // entity.position = new PIXI.Point(
    //   Math.random() * (window.innerWidth / 2),
    //   window.innerHeight / 2 - 64
    // )
    // entity.position.previous = new PIXI.Point()
    // entity.velocity = new PIXI.Point()
    entity.velocity = {x: 0, y: 0}
    entity.gravity = {x: 0, y: 2000}
    // entity.gravity = new PIXI.Point(0, 2000)
    entity.input = {
      id: undefined,
      right: 39,
      left: 37,
      jump: 32
    }

    return entity
  }
}

module.exports = GameObjectFactory
// module.exports = window.GameObjectFactory = GameObjectFactory
