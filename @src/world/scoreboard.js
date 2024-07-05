const resolveName = (object) => {
    if (typeof object === "string") return object;
    if ("name" in object) return object.name;
    if (object instanceof ScoreboardIdentity) return object.displayName;
    throw TypeError("object is invalid");
}

class Scoreboard {
    /** @type {import("./world").World} */
    #world;

    constructor(world) {
        this.#world = world;
    }

    async getParticipants() {
        const { statusCode, statusMessage } = await this.#world.runCommandAsync("scoreboard players list");
        if (statusCode !== 0) return [];
        const participants = statusMessage.split("\n")[1].split(", ");
        return participants.map((displayName) => new ScoreboardIdentity(this.#world, displayName));
    }
    
    async addObjective(objectiveId, displayName = "") {
        const { statusCode } = await this.#world.runCommandAsync(`scoreboard objectives add "${objectiveId}" dummy` + (displayName ? ` "${displayName}"` : ""));
        if (statusCode === 0) return new ScoreboardObjective(this.#world, objectiveId, displayName);
    }
    
    async getObjective(objectiveId) {
        const objectives = await this.getObjectives();
        return objectives.find((objective) => objective.id === objectiveId);
    }
    
    async removeObjective(objective) {
        const objectiveId = typeof objective === "string" ? objective : objective.id;
        const { statusCode } = await this.#world.runCommandAsync(`scoreboard objectives remove "${objectiveId}"`);
        return statusCode === 0;
    }

    async getObjectives() {
        const { statusCode, statusMessage } = await this.#world.runCommandAsync("scoreboard objectives list");
        if (statusCode !== 0) return [];
        const match = [...statusMessage.matchAll(/- (.*): '(.*)'.*'(.*)'/g)]; 
        return match.map(([, objectiveId, displayName]) => new ScoreboardObjective(this.#world, objectiveId, displayName));
    }

    async setObjectiveAtDisplaySlot(displaySlotId, objectiveDisplaySetting) {
        const { objective, sortOrder } = objectiveDisplaySetting;
        const objectiveId = typeof objective === "string" ? objective : objective.id;
        const { statusCode } = displaySlotId === DisplaySlotId.BelowName
            ? await this.#world.runCommandAsync(`scoreboard objectives setdisplay ${displaySlotId} "${objectiveId}"`)
            : await this.#world.runCommandAsync(`scoreboard objectives setdisplay ${displaySlotId} "${objectiveId}"` + (sortOrder ? ` ${sortOrder}` : ""));
        if (statusCode === 0) return await this.getObjective(objectiveId);
    }

    async clearObjectiveAtDisplaySlot(displaySlotId) {
        const { statusCode } = await this.#world.runCommandAsync(`scoreboard objectives setdisplay ${displaySlotId}`);
        return statusCode === 0;
    }//:  ScoreboardObjective | undefined;

    async getInfo(participant) {
        const name = resolveName(participant); 
        const { statusCode, statusMessage } = await this.#world.runCommandAsync(`scoreboard players list "${name}"`);
        if (statusCode !== 0) return;
        const match = [...statusMessage.matchAll(/- (.*): ([-]?\d+) \((.*)\)/g)];
        return match.map(([, displayName, score, objectiveId]) => ({ objective: new ScoreboardObjective(this.#world, objectiveId, displayName), score: Number(score) }));
    }

}

class ScoreboardIdentity {
    /** @type {import("./world").World} */
    #world;

    constructor(world, displayName) {
        this.#world = world;
        this.displayName = displayName;
    }
    
    get type() {
        return this.getPlayer()
            ? ScoreboardIdentityType.Player
            : ScoreboardIdentityType.FakePlayer;
    }

    getPlayer() {
        const [player] = this.#world.getPlayers({ name: this.displayName });
        return player;
    }
}

class ScoreboardObjective {
    /** @type {import("./world").World} */
    #world;

    constructor(world, id, displayName = id) {
        this.#world = world;
        this.id = id;
        this.displayName = displayName;
    }

    async addScore(participant, score) {
        const name = typeof participant === "string" ? participant : participant.name;
        const { statusCode, statusMessage } = await this.#world.runCommandAsync(`scoreboard players add "${name}" "${this.id}" ${score}`);
        if (statusCode === 0) {
            const [, current] = statusMessage.match(/\(.* ([-]?\d+)\)/) ?? [];
            if (current) return Number(current);
        }
    }

    removeScore(participant, score) {
        return this.addScore(participant, -score);
    }

    async getScore(participant) {
        const info = await this.#world.scoreboard.getInfo(participant);
        const { score } = info.find(({ objective }) => objective.id === this.id) ?? {};
        return score;
    }

    async setScore(participant, score) {
        const name = resolveName(participant);
        const { statusCode } = await this.#world.runCommandAsync(`scoreboard players set "${name}" "${this.id}" ${score}`);
        return statusCode === 0;
    }

    async hasParticipant(participant) {
        const info = await this.#world.scoreboard.getInfo(participant);
        return info.some(({ objective }) => objective.id === this.id);
    }

    async removeParticipant(participant) {
        const name = resolveName(participant);
        const { statusCode } = await this.#world.runCommandAsync(`scoreboard players reset "${name}"`);
        return statusCode === 0;
    }


} 

const ScoreboardIdentityType = {
    Player: "Player",
    FakePlayer: "FakePlayer"
}

const DisplaySlotId = {
    BelowName: "belowName",
    List: "list",
    Sidebar: "sidebar"
}

const ObjectiveSortOrder = {
    Ascending: "ascending",
    Descending: "descending"
}

module.exports = { Scoreboard, ScoreboardObjective, ScoreboardIdentityType, DisplaySlotId, ObjectiveSortOrder };