const { v4: uuidv4 } = require("uuid");
const VERSION = require("../version.json");

class SocketEvent {
    #socket;

    #events = new Map();

    constructor(socket) {
        this.#socket = socket;
        socket.on("message", (data, isBinary) => {
            if (isBinary) return console.error("[Invalid] data is binary");
            let packet = null;
            try { packet = JSON.parse(data.toString()); } catch (e) { console.error(e, e.stack); };
            if (!packet) return;
            const { eventName, messagePurpose } = packet.header;
            if (messagePurpose !== "event") return;
            if (this.#events.has(eventName)) this.#events.get(eventName)(packet);
        });
    }

    subscribe(eventName, listener) {
        this.#socket.send(JSON.stringify({
            "header": {
                "version": VERSION, 
                "requestId": uuidv4(),
                "messageType": "commandRequest", 
                "messagePurpose": "subscribe"
            },
            "body": {
                "eventName": eventName
            }
        }));

        if (listener) this.#events.set(eventName, listener);
    }
    
    unsubscribe(eventName) {
        this.#socket.send(JSON.stringify({
            "header": {
                "version": 1, 
                "requestId": uuidv4(),
                "messageType": "commandRequest",
                "messagePurpose": "unsubscribe"
            },
            "body": {
                "eventName": eventName
            }
        }));

        this.#events.delete(eventName);
    }
}

module.exports = { SocketEvent };
