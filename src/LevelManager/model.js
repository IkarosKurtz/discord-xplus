const { model, Schema } = require('mongoose')

const UserSchema = new Schema({
	guildId: { type: String, required: true },
	data: { type: Array, default: [] }
})

const Users = model('experience', UserSchema)

module.exports = Users
