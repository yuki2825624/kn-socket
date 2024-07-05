const VERSION = require("../version.json");
const { ScoreboardIdentity } = require("../world/scoreboard");
const { ScreenDisplay } = require("./screenDisplay");

class Player {
    /** @type {import("../world/world").World} */
    #world;

    constructor(world, name) {
        this.#world = world;
        this.name = name;
    }

    get id() {
        return "id" in this.detail ? String(this.detail.id) : null;
    }

    get nameTag() {
        return "nameTag" in this.detail ? this.detail.nameTag : null;
    }

    get detail() {
        const details = this.#world.getPlayerDetails();
        if (details.has(this.name)) return details.get(this.name);
    }

    get scoreboardIdentity() {
        return new ScoreboardIdentity(this.#world, this.name);
    }

    get onScreenDisplay() {
        return new ScreenDisplay(this);
    }

    matches(options) {
        return this.#world.getPlayers(Object.assign(options, { name: this.name })).length > 0;
    }

    runCommandAsync(commandLine, version = VERSION) {
        return this.#world.runCommandAsync(`execute as "${this.name}" at @s run ${commandLine}`, version);
    }

    async sendMessage(message) {
        const json = { rawtext: [typeof message === "string" ? { "text": message } : message] };
        await this.runCommandAsync(`tellraw @s ${JSON.stringify(json)}`);
    }

    async addTag(tag) {
        const format = tag.replace(/(\"|\\)/g, "\\\$1");
        const { statusCode } = await this.#world.runCommandAsync(`tag "${this.name}" add "${format}"`);
        return statusCode === 0;
    }

    async removeTag(tag) {
        const format = tag.replace(/(\"|\\)/g, "\\\$1");
        const { statusCode } = await this.#world.runCommandAsync(`tag "${this.name}" remove "${format}"`); 
        return statusCode === 0;
    }

    async hasTag(tag) {
        const format = tag.replace(/(\"|\\)/g, "\\\$1");
        return (await this.getTags()).includes(format);
    }

    async getTags() {
        const { statusCode, statusMessage } = await this.#world.runCommandAsync(`tag "${this.name}" list`);
        if (statusCode !== 0) return [];
        const match = statusMessage.match(/§a.*?§r/g) ?? [];
        return match.map((tag) => tag.slice(2, -2));
    }

    async addScore(objective, score) {
        const objectiveId = typeof objective === "string" ? objective : objective.id;   
        const { statusCode, statusMessage } = await this.#world.runCommandAsync(`scoreboard players add "${this.id}" "${objectiveId}" ${score}`);
        if (statusCode === 0) {
            const [, current] = statusMessage.match(/\(.* ([-]?\d+)\)/) ?? [];
            if (current) return Number(current);
        }
    }

    removeScore(objective, score) {
        return this.addScore(objective, -score);
    }

    async getScore(objective) {
        const objectiveId = typeof objective === "string" ? objective : objective.id;   
        const info = await this.#world.scoreboard.getInfo(this.name);
        const { score } = info.find(({ objective }) => objective.id === objectiveId) ?? {};
        return score;
    }    

    async setScore(objective, score) {
        const objectiveId = typeof objective === "string" ? objective : objective.id;   
        const { statusCode } = await this.#world.runCommandAsync(`scoreboard players set "${this.name}" "${objectiveId}" ${score}`);
        return statusCode === 0;
    }

    async resetScore(objective) {
        const objectiveId = typeof objective === "string" ? objective : objective.id;   
        const { statusCode } = await this.#world.runCommandAsync(`scoreboard players reset "${this.name}" "${objectiveId}"`);
        return statusCode === 0;
    }
}

module.exports = { Player };