/** @typedef {import("./interfaces").Rank} Rank */

/** Create a new rank to be used in the level manager */
class RankBuilder {
	/** @return {string} - string representation of the rank */
	toString() {
		return `rank: ${this.nameplate}, color: ${this.color}, minXp: ${this.min}, maxXp: ${this.max}, value: ${this.value}`
	}

	/** @return {Rank} - The rank object */
	toRank() {
		return {
			nameplate: this.nameplate,
			color: this.color,
			min: this.min,
			max: this.max,
			value: this.value
		}
	}

	/**
	 * Set the nameplate of the rank
	 * @param {string} nameplate - The nameplate of the rank
	 */
	setNameplate(nameplate) {
		this.nameplate = nameplate
		return this
	}

	/**
	 * Set the color of the rank
	 * @param {string} color - The color of the rank
	 */
	setColor(color) {
		this.color = color
		return this
	}

	/**
	 * Set the minimum xp to be in this rank
	 * @param {number} min - The minimum xp to be in this rank
	 */
	setMin(min) {
		this.min = min
		return this
	}

	/**
	 * Set the maximum xp to be in this rank
	 * @param {number} max - The maximum xp to be in this rank
	 */
	setMax(max) {
		this.max = max
		return this
	}

	/**
	 * Set the value of the rank (used to compare ranks, the higher the value, the higher the rank)
	 * @param {number} value - The value of the rank
	 */
	setValue(value) {
		this.value = value
		return this
	}
}

module.exports = { RankBuilder }
