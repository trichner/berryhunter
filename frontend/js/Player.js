class Player {
	constructor(id, x, y) {
		gameStarted = true;

		this.character = new Character(id, x, y);

		this.controls = new Controls(this.character);

		// Has to be registered only when it's the player character as
		// we don't want to manipulate other players characters that are shown
		two.bind('update', this.character.update.bind(this.character));

		this.camera = new Camera(this.character);
		miniMap.register(this.character);

		this.inventory = new Inventory(this.character);

		this.vitalSigns = new VitalSigns();

		this.craftableItems = [];
	}
}