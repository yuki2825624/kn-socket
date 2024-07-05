class ScreenDisplay {
    /** @type {import("./player").Player} */
    #player;

    constructor(player) {
        this.#player = player;
    }

    async setActionbar(text) {
        const rawtext = this.#rawtext(text);
        this.#player.runCommandAsync(`titleraw @s actionbar ${JSON.stringify(rawtext)}`);
    }

    async setTitle(title, options = {}) {
        const { fadeInDuration = null, fadeOutDuration = null, stayDuration = null, subtitle } = options;
        const commands = [];

        if ("fadeInDuration" in options && "fadeOutDuration" in options && "stayDuration" in options)
            commands.push(this.#player.runCommandAsync(`titleraw @s times ${fadeInDuration} ${stayDuration} ${fadeOutDuration}`));

        const rawtext = this.#rawtext(title);
        commands.push(this.#player.runCommandAsync(`titleraw @s title ${JSON.stringify(rawtext)}`));
        
        if ("subtitle" in options) {
            const rawtext = this.#rawtext(subtitle);
            commands.push(this.#player.runCommandAsync(`titleraw @s subtitle ${JSON.stringify(rawtext)}`));
        }

        return (await Promise.all(commands)).every(({ statusCode }) => statusCode === 0);
    }

    async updateSubtitle(subtitle) {
        const rawtext = this.#rawtext(subtitle);
        const { statusCode } = await this.#player.runCommandAsync(`titleraw @s subtitle ${JSON.stringify(rawtext)}`);
        return statusCode === 0;
    }

    async clear() {
        const { statusCode } = await this.#player.runCommandAsync("titleraw @s clear");
        return statusCode === 0;
    }

    #rawtext(text) {
        return { rawtext: [typeof text === "string" ? { "text": text } : text] };
    }
}

module.exports = { ScreenDisplay };