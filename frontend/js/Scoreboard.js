'use strict';

define(['userInterface/UserInterface', 'Utils'], function (UserInterface, Utils) {
	const Scoreboard = {};

	Scoreboard.setup = function () {
		this.domElement = UserInterface.getScoreboard();
		this.playerRowTemplate = this.domElement.getElementsByClassName('playerRow').item(0);
		this.rowContainer = this.playerRowTemplate.parentNode;
		this.rowContainer.removeChild(this.playerRowTemplate);
		this.rows = [];
	};

	Scoreboard.updateFromBackend = function (scoreboardMessage) {
        this.domElement.classList.remove('hidden');
		let players = scoreboardMessage.players;
		if (this.rows.length !== players.length) {
			Utils.clearNode(this.rowContainer);
			this.rows.length = 0;
			for (let i = 0; i < players.length; i++) {
				let row = this.playerRowTemplate.cloneNode(true);
				this.rows.push({
					row: row,
					rank: row.getElementsByClassName('rank')[0],
					name: row.getElementsByClassName('name')[0],
					score: row.getElementsByClassName('score')[0],
				});
				this.rowContainer.appendChild(row);
			}
		}

        for (let i = 0; i < players.length; i++) {
			this.rows[i].name.textContent = players[i].name;
			if (players[i].score !== 0){
				this.rows[i].score.textContent = players[i].score;
			}
		}
	};

    return Scoreboard;
});