"use strict";

define([], function () {
	class ScoreboardMessage {
		/**
		 *
		 * @param {BerryhunterApi.Scoreboard} scoreboard
		 */
		constructor(scoreboard){


			this.players = [];
			for (let i = 0; i < scoreboard.playersLength(); ++i) {
				this.players.push(unmarshalPlayer(scoreboard.players(i)));
			}
		}
	}

	/**
	 *
	 * @param { BerryhunterApi.ScoreboardPlayer} scoreboardPlayer
	 */
	function unmarshalPlayer(scoreboardPlayer) {
		return {
			name: scoreboardPlayer.name(),
			score: scoreboardPlayer.score().toFloat64()
		}
	}

	return ScoreboardMessage;
});