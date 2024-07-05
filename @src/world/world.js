const fs = require("fs");
const path = require("path");
const { WebSocket, OPEN } = require("ws");
const { Player } = require("../player/player");
const { WorldEvents } = require("./events");
const { SocketEvent } = require("./socketEvent");
const { Command } = require("./command");
const { Scoreboard, ScoreboardIdentityType } = require("./scoreboard");
const VERSION = require("../version.json");
const { DisplaySlotId } = require("./scoreboard");
const { ObjectiveSortOrder } = require("./scoreboard");

class World {
    #ws;

    /** @type {Command} */
    #command;

    #data = { startTime: Date.now(), ping: -1, currentPlayerCount: 0, maxPlayerCount: 0, lastPlayers: [], owner: null };

    constructor(options) {
        this.#ws = new WebSocket.Server(options);
        this.events = new WorldEvents();

        setTimeout(() => {
            this.#ws.on("connection", (socket, request) => {
                if (this.#ws.clients.size > 1) return socket.close();
                this.socket = socket;

                this.#command = new Command(socket);
                const events = new SocketEvent(socket);
                events.subscribe("commandResponse");
                events.subscribe("PlayerMessage", async ({ body: packet }) => {
                    const { type, message } = packet;
                    if (type === "chat") {
                        const [sender] = this.getPlayers({ name: packet.sender });
                        this.events.emit("playerChat", { message, sender });
                    }
                    if (type === "tell") { // MEMO: 何故かnameTag返ってくる
                        this.events.emit("tellChat", { message, sender: packet.sender, receiver: packet.receiver });
                    }
                });

                this.events.emit("connection");
                
                let currentTick = 0, lastTime = Date.now();
                const handle = () => {
                    const deltaTime = currentTick > 0 ? Date.now() - lastTime : 50;
                    this.events.emit("tick", { currentTick, deltaTime });
                    currentTick++;

                    if (currentTick % 20 * 5 === 0) this.#handlePlayers();
                    lastTime = Date.now();
                }

                handle();
                setInterval(handle, 50);
            });

            this.#ws.on("close", () => this.events.emit("close"));
            this.#ws.on("error", (error) => this.events.emit("error", error));
        }, 1000 * 2);
    }

    get currentPlayerCount() {
        return this.#data.currentPlayerCount;
    }

    get maxPlayerCount() {
        return this.#data.maxPlayerCount;
    }

    get ping() {
        return this.#data.ping;
    }

    get owner() {
        return this.#data.owner ? new Player(this, this.#data.owner) : null;
    }

    get scoreboard() {
        return new Scoreboard(this);
    }

    async #handlePlayers() {
        if (this.socket.readyState !== OPEN) return;
        const playerDetails = this.getPlayerDetails();
        const nameTags = new Map(), details = new Map();
        const playerNames = [];

        const start = Date.now();
        const list = await this.runCommandAsync("list");
        this.#data.ping = Date.now() - start;

        if (list.statusCode === 0) {  
            this.#data.currentPlayerCount = list.currentPlayerCount;
            this.#data.maxPlayerCount = list.maxPlayerCount;
            
            playerNames.push(...list.statusMessage.split("\n")[1].split(", "));
            const playerNameTags = list.players.split(", ");
            playerNames.forEach((name, i) => nameTags.set(name, playerNameTags[i]));
    
            const joinPlayers = playerNames.filter((name) => !this.#data.lastPlayers.includes(name));
            const leavePlayers = this.#data.lastPlayers.filter((name) => !playerNames.includes(name));
    
            for (const name of joinPlayers) {
                this.events.emit("playerJoin", { player: new Player(this, name) });
            }
    
            for (const name of leavePlayers) {
                this.events.emit("playerLeave", { player: new Player(this, name) });
            }   

            if (playerNames.length === 0) {
                this.#data.owner = null;
            }

            this.#data.lastPlayers = playerNames;
        }
        else {
            return;
        }

        const listd = await this.runCommandAsync("listd");
        if (listd.statusCode === 0) {
            const data = JSON.parse(listd.details.match(/\{.*\}/)[0]).result;
            for (const detail of data) {
                const { name } = detail;
                details.set(name, detail);
            }

            if (!this.#data.owner)
                this.runCommandAsync("testfor @s")
                    .then(({ statusCode, victim = [] }) => {
                        if (statusCode === 0 && victim.length > 0)
                            this.#data.owner = victim[0];
                    });
        }

        for (const name of playerNames) {
            const nameTag = nameTags.has(name) ? nameTags.get(name) : name;
            const detail = details.has(name) ? details.get(name) : playerDetails.get(name);
            playerDetails.set(name, Object.assign({ nameTag }, detail));
        }

        this.#setPlayerDetails(playerDetails);
    }

    #setPlayerDetails(details) {
        const file = path.resolve(__dirname, "../data/players.json");
        fs.writeFileSync(file, JSON.stringify(Array.from(details), false, 4));
    }

    getPlayerDetails() {
        const file = path.resolve(__dirname, "../data/players.json"); 
        fs.stat(file, (_, stats) => {
            if (!stats) fs.writeFileSync(file, "[]");
        });
    
        if (!fs.readFileSync(file, { encoding: "utf-8" }).trim())
            fs.writeFileSync(file, "[]");
    
        return new Map(JSON.parse(fs.readFileSync(file, { encoding: "utf-8" })));
    }

    async close() {
        await this.runCommandAsync("closewebsocket");
        this.socket.close();
    }

    getPlayers(options = {}) {
        if (this.socket.readyState !== OPEN) return [];
        return this.#data.lastPlayers.map((name) => new Player(this, name))
            .filter((player) => {
                let flag = true;
                if ("name" in options && typeof options.name === "string") flag = player.name === options.name;
                if ("nameTag" in options && typeof options.nameTag === "string") flag === player.nameTag === options.nameTag;
                return flag;
            });
    }

    runCommandAsync(commandLine, version = VERSION) {
        return this.#command.run(commandLine, version);
    }

    async sendMessage(message) {
        const json = { rawtext: [typeof message === "string" ? { "text": message } : message] };
        await this.runCommandAsync(`tellraw @a ${JSON.stringify(json)}`);
    }

    #getDynamicProperties() {
        const file = path.resolve(__dirname, "../data/dynamicProperty/world.json"); 
        fs.stat(file, (_, stats) => {
            if (!stats) fs.writeFileSync(file, "[]");
        });
    
        if (!fs.readFileSync(file, { encoding: "utf-8" }).trim())
            fs.writeFileSync(file, "[]");
    
        return new Map(JSON.parse(fs.readFileSync(file, { encoding: "utf-8" })));
    }

    #setDynamicProperties(data) {
        const file = path.resolve(__dirname, "../data/players.json");
        fs.writeFileSync(file, JSON.stringify([...data], false, 4));
    }

    setDynamicProperty(identifier, value) {
        const object = this.#getDynamicProperties();
        if (value === undefined) object.delete(identifier);
            else object.set(identifier, value);
        this.#setDynamicProperties(object);
    }

    getDynamicProperty(identifier) {
        const object = this.#getDynamicProperties();
        return object.get(identifier);
    }

    hasDynamicProperty(identifier) {
        return this.getDynamicPropertyIds().includes(identifier);
    }
    
    clearDynamicProperties() {
        this.#setDynamicProperties([]);
    }

    getDynamicPropertyIds() {
        const object = this.#getDynamicProperties();
        return [...object.keys()];
    }
}

module.exports = { World, ScoreboardIdentityType, DisplaySlotId, ObjectiveSortOrder };