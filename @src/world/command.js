const { v4: uuidv4 } = require("uuid");
const { OPEN } = require("ws");
const VERSION = require("../version.json");

class Command {
    #socket;

    #requests = new Map();

    constructor(socket) {
        this.#socket = socket;
        socket.on("message", (data, isBinary) => {
            if (isBinary) throw TypeError("Socket data is binary.");
            let packet = null;
            try { packet = JSON.parse(data.toString()); } catch (e) { console.error(e, e.stack); };
            if (!packet) return;
            const { messagePurpose, requestId } = packet.header;
            if (messagePurpose !== "commandResponse") return;
            if (this.#requests.has(requestId)) this.#requests.get(requestId)(packet.body);
        });
    }

    run(commandLine, version = VERSION) {
        if (this.#socket.readyState !== OPEN) return { statusCode: -1, statusMessage: "WebSocket is not opening." };
        if (commandLine.startsWith("/")) commandLine = commandLine.slice(1);

        console.log("Run Command:", commandLine);
        return new Promise((resolve, reject) => {
            const requestId = uuidv4();
    
            const data = JSON.stringify({
                "header": {
                    "requestId": requestId,
                    "messagePurpose": "commandRequest",
                    "version": 1,
                    "messageType": "commandRequest"
                },
                "body": {
                    "origin": {
                        "type": "player"
                    },
                    "commandLine": commandLine,
                    "version": version
                }
            });
            this.#socket.send(data);
            
            const timeout = setTimeout(() => {
                if (this.#socket.readyState !== OPEN) {
                    resolve({ statusCode: -1, statusMessage: "WebSocket is not opening." });
                }
                else {
                    reject(new Error(`Timeout command request: ${JSON.stringify(data)}`));
                }
            }, 1000 * 5);

            this.#requests.set(requestId, (data) => {
                // console.log(data);
                clearTimeout(timeout);
                resolve(data);
            });
        }); 
    }
}

module.exports = { Command };