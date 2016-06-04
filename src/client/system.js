let EventEmitter = require('./event-emitter')

/**
 * Base class for systems. Handles managing of per system entity lists.
 * @class
 */
class System {
  /**
   * Create a new system with component requirements
   * @param {Array<String>} components - List of component names that the system
   * requires
   * @constructor
   */
  constructor (components) {
    this.entities = []
    this.components = components || []

    EventEmitter.on('componentAdded', ({entity, component}) => {
      if (this.entities.indexOf(entity) !== -1) {
        return
      }

      for (let c of this.components) {
        if (typeof entity[c] === 'undefined') {
          return
        }
      }

      this.add(entity)
    })

    EventEmitter.on('componentRemoved', ({entity, component}) => {
      if (this.components.indexOf(component) === -1) {
        return
      }

      let index = this.entities.indexOf(entity)

      if (index === -1) {
        return
      }

      this.remove(index, entity)
    })

    EventEmitter.on('entityRemoved', (entity) => {
      let index = this.entities.indexOf(entity)

      if (index === -1) {
        return
      }

      this.remove(index, entity)
    })
  }

  /**
   * Update the systems entities
   * @param {Number} delta - The frame Time
   * @param {...*} params - Optional parameters to be passed to the system
   * handler
   */
  update (delta, ...params) {
    this.begin(delta)
    for (let i = 0, len = this.entities.length; i < len; i++) {
      this.handle(delta, this.entities[i], params)
    }
    this.end(delta)
  }

  /**
   * Handle entities being added to the system
   * @param {Entity} entity - The entity being added
   */
  add (entity) {
    this.entities.push(entity)
  }

  /**
   * Handle removing of the entity from the system list
   * @param {Number} index - The index of the entity being removed
   * @param {Entity} entity - The entity being removed
   */
  remove (index, entity) {
    this.entities.splice(index, 1)
  }

  /**
   * Stub function to be overwritten by child classes
   */
  begin () {}

  /**
   * Stub function to be overwritten by child classes
   */
  handle () {}

  /**
   * Stub function to be overwritten by child classes
   */
  end () {}
}

module.exports = System
