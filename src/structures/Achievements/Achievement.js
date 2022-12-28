const { AchievementType } = require('./Interfaces')

/**
 * @typedef {import("../../../typings").AchievementOptions<T>} AchievementOptions
 * @template [T=any]
 */

/** @typedef {import("../../../typings").AchievementType} AchievementType */

/**
 * Represents an achievement in the level manager.
 * @template [T=any]
 */
class AchievementBuilder {
	/**
	 *
	 * @param {AchievementOptions<T>} [data] - The data of the achievement.
	 */
	constructor(data) {
		if (data && typeof data !== 'object') throw new TypeError('The data of the achievement must be an object.')

		/**
		 * @type {AchievementOptions<T>} - The data of the achievement.
		 * @private
		 */
		this._data = {
			name: data.name ?? 'None',
			description: data.description ?? 'None',
			thumbnail: data.thumbnail ?? 'https://cdn-icons-png.flaticon.com/512/3524/3524344.png',
			type: data.type ?? AchievementType.OneAction
		}

		if (data.extraData) this._data.extraData = data.extraData
	}

	/**
	 * The data of the achievement.
	 * @type {AchievementOptions<T>}
	 * @return {AchievementOptions<T>}
	 * @readonly
	 */
	get data() {
		return this._data
	}

	/**
	 * @param {string} name - The name of the achievement.
	 * @returns {AchievementBuilder<T>}
	 */
	setName(name) {
		if (typeof name !== 'string') throw new TypeError('The name of the achievement must be a string.')

		this._data.name = name
		return this
	}

	/**
	 * @param {string} description - The description of the achievement.
	 * @returns {AchievementBuilder<T>}
	 */
	setDescription(description) {
		if (typeof description !== 'string') throw new TypeError('The description of the achievement must be a string.')

		this._data.description = description
		return this
	}

	/**
	 *
	 * @param {string} thumbnail - The image of the achievement.
	 * @returns {AchievementBuilder<T>}
	 */
	setThumbnail(thumbnail) {
		if (typeof thumbnail !== 'string') throw new TypeError('The image of the achievement must be a string.')

		this._data.thumbnail = thumbnail
		return this
	}

	/**
	 * @param {AchievementType} type - The type of the achievement.
	 * @returns {AchievementBuilder<T>}
	 */
	setType(type) {
		if (typeof type !== 'number') throw new TypeError('The type of the achievement must be a AchievementType.')

		this._data.type = type
		return this
	}

	/**
	 * @param {T} extraData - Extra data that will be saved in the database.
	 * @returns {AchievementBuilder<T>}
	 */
	setExtraData(extraData) {
		this._data.extraData = extraData
		return this
	}

	/**
	 * @returns {string} - Returns a representation of the achievement.
	 */
	toString() {
		return `Name: ${this._data.name}, Description: ${this._data.description}, Thumbnail: ${this._data.thumbnail}, Type: ${this._data.type}, ExtraData: ${this._data.extraData}`
	}

	/**
	 * Returns a plain JSON object with the data of the achievement.
	 * @returns {AchievementOptions<T>}
	 */
	toJSON() {
		return this._data
	}
}

module.exports = { AchievementBuilder }
