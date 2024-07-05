const { EventEmitter } = require("events");

class WorldEvents {
    #emitter = new EventEmitter();

    on(eventName, listener) {
        this.#emitter.on(eventName, listener);
        return listener;
    }

    off(eventName, listener) {
        this.#emitter.off(eventName, listener);
    }

    emit(eventName, eventData) {
        this.#emitter.emit(eventName, eventData);
    }
}

module.exports = { WorldEvents };