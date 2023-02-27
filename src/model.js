const { model, Schema } = require('mongoose')

const UserSchema = new Schema({
  guildId: { type: String, required: true },
  ranks: { type: Array, default: [] },
  achievements: { type: Array, default: [] },
  users: { type: Array, default: [] }
})

const GuildsData = model('experience', UserSchema)

module.exports = { GuildsData }
