/**
 * Class representing an entity. Contains an id and components.
 * @class
 */
class Entity {
  /**
   * Create an entity with an id
   * @constructor
   * @param {number} id - The unique id for the entity
   */
  constructor (id = Math.floor(Math.random() * -10000)) {
    this.id = id
  }
}

module.exports = Entity
