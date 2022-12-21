/** @typedef {import("../../typings").Rank} Rank */

/** Builder for the rank class, it must have all the data to be implemented in the manager in order to work */
class RankBuilder {
	constructor() {
		/**
		 * @type {Rank}
		 * @private
		 */
		this._data = {
			nameplate: undefined,
			color: undefined,
			min: undefined,
			max: undefined,
			value: undefined
		}
	}

	/**
	 * Represents the rank as a sting
	 * @return {string} - string representation of the rank
	 */
	toString() {
		return `rank: ${this._data.nameplate}, color: ${this._data.color}, minXp: ${this._data.min}, maxXp: ${this._data.max}, value: ${this._data.value}`
	}

	/**
	 * Represents the rank as a JSON
	 * @return {Rank} - Return a plain object with all the data of the rank
	 */
	toJSON() {
		return this._data
	}

	/**
	 * @return {boolean} - Return true if the rank has all the data needed to be implemented in the manager
	 * @private
	 */
	_missingData() {
		// @ts-ignore
		return !this._data.nameplate || !this._data.color || this._data.min < 0 || this._data.max < 0 || this._data.value < 0
	}

	/**
	 * Set the nameplate of the rank
	 * @param {string} nameplate - The nameplate of the rank
	 */
	setNameplate(nameplate) {
		if (typeof nameplate !== 'string') throw new TypeError('The nameplate must be a string')

		/** @private */
		this._data.nameplate = nameplate
		return this
	}

	/**
	 * Set the color of the rank
	 * @param {import("discord.js").ColorResolvable | string} color - The color of the rank
	 */
	setColor(color) {
		if (typeof color !== 'string') throw new TypeError('The color must be a string')

		/** @private */
		this._data.color = color
		return this
	}

	/**
	 * Set the minimum xp to be in this rank
	 * @param {number} min - The minimum xp to be in this rank
	 */
	setMin(min) {
		if (typeof min !== 'number' || min < 0) throw new TypeError('The minimum xp must be a positive integer number')

		/** @private */
		this._data.min = min
		return this
	}

	/**
	 * Set the maximum xp to be in this rank
	 * @param {number} max - The maximum xp to be in this rank
	 */
	setMax(max) {
		if (typeof max !== 'number' || max < 0) throw new TypeError('The minimum xp must be a positive integer number')

		/** @private */
		this._data.max = max
		return this
	}

	/**
	 * Set the value of the rank (used to compare ranks, the higher the value, the higher the rank)
	 * @param {number} value - The value of the rank
	 */
	setValue(value) {
		if (typeof value !== 'number' || value < 0) throw new TypeError('The minimum xp must be a positive integer number')

		/** @private */
		this._data.value = value
		return this
	}
}

module.exports = { RankBuilder }
