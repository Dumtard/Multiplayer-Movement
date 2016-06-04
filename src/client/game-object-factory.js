/**
 * EntityManager
 * @type {EntityManager}
 */
let EntityManager = require('./entity-manager')

let PIXI = window.PIXI

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

    let sprite = PIXI.Sprite.fromImage('resources/square.png')
    sprite.tint = Math.random() * 0xFFFFFF
    sprite.scale.set(0.48, 0.64)

    entity.sprite = sprite
    entity.position = new PIXI.Point(
      Math.random() * (window.innerWidth / 2),
      window.innerHeight / 2 - 64
    )
    entity.position.previous = new PIXI.Point()
    entity.velocity = new PIXI.Point()
    entity.gravity = new PIXI.Point(0, 2000)
    entity.input = {
      'right': 39,
      'left': 37,
      'jump': 32
    }

    return entity
  }

  /**
   * Create a tile entity
   * @static
   * @return {Entity} Tile Entity
   */
  static createTile () {
    let entity = EntityManager.createEntity()

    let sprite = PIXI.Sprite.fromImage('resources/square.png')
    sprite.tint = Math.random() * 0xFFFFFF
    sprite.scale.set(0.32, 0.32)

    entity.sprite = sprite
    entity.position = new PIXI.Point(
      Math.random() * (window.innerWidth / 2),
      window.innerHeight / 2 - (Math.floor(Math.random() * 2) + 1) * 32
    )
    entity.position.previous = entity.position

    return entity
  }
}

module.exports = window.GameObjectFactory = GameObjectFactory
