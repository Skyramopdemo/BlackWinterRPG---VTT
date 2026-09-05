const SYSTEM_ID = "blackwinterrpg";

const DEFAULT_ACTOR_SYSTEM = {
	health: { value: 10, max: 10 },
	stamina: { value: 5, max: 5 },
	defense: 10,
	attributes: { might: 0, agility: 0, spirit: 0, wits: 0 }
};

Hooks.once("init", () => {
	Actors.registerSheet(SYSTEM_ID, BlackwinterActorSheet, {
		types: ["character", "npc"],
		makeDefault: true,
		label: "BLACKWINTER.SHEETS.ACTOR"
	});
	console.info("[BlackwinterRPG] Núcleo carregado.");
});

Hooks.on("preCreateActor", (actor, data) => {
	const system = foundry.utils.deepClone(DEFAULT_ACTOR_SYSTEM);
	foundry.utils.mergeObject(system, data.system ?? {}, { inplace: true });
	actor.updateSource({ type: data.type || "character", system });
});

class BlackwinterActorSheet extends foundry.appv1.sheets.ActorSheet {
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["blackwinterrpg", "sheet", "actor"],
			template: "systems/blackwinterrpg/templates/actor-sheet.hbs",
			width: 640,
			height: 720
		});
	}

	getData(options = {}) {
		const context = super.getData(options);
		context.isCharacter = this.actor.type === "character";
		return context;
	}

	activateListeners(html) {
		super.activateListeners(html);
		html.find(".rollable").on("click", this._onRoll.bind(this));
	}

	async _onRoll(event) {
		event.preventDefault();
		const button = event.currentTarget;
		const roll = await new Roll(button.dataset.formula || "1d20").evaluate();
		await roll.toMessage({
			speaker: ChatMessage.getSpeaker({ actor: this.actor }),
			flavor: button.dataset.label || game.i18n.localize("BLACKWINTER.ROLL.TEST")
		});
	}
}

