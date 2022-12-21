const { model, Schema } = require('mongoose')

const UserSchema = new Schema({
	guildId: { type: String, required: true },
	ranks: { type: Array, default: [] },
	data: { type: Array, default: [] }
})

const Users = model('experience', UserSchema)

module.exports = Users
