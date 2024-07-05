const { World } = require("./@src/index");

const world = new World({ port: 30000 });

world.events.on("connection", () => {
    console.log("[Log] Websocket connection! :)"); 
});

world.events.on("playerJoin", (ev) => {
    const { player } = ev;
    console.log(`[PlayerJoin] ${player.name}`);
    world.sendMessage(`§a[PlayerJoin] ${player.name} ->§r`);
});

world.events.on("playerLeave", (ev) => {
    const { player } = ev;
    console.log(`[PlayerLeave] ${player.name}`);
    world.sendMessage(`§c[PlayerLeave] ${player.name} <-§r`);
});

world.events.on("playerChat", (ev) => {
    const { sender, message } = ev;
    console.log(`[Chat] ${sender.name} > ${message}`); 
});

world.events.on("tellChat", (ev) => {
    const { sender, receiver, message } = ev;
    console.log(`[Tell] ${sender} -> ${receiver} > ${message}`);
});

world.events.on("close", () => {
    console.log("[Log] Websocket close :|");
});

world.events.on("error", console.error);