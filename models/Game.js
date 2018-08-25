const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const gameSchema = new mongoose.Schema({
    boardSettings: {
        type: String,
        index: true,
        lowercase: true,
        match: /^([0-9]+x){2}[0-9]+$/,
        required: true
    },
    date: { 
        type: Date, 
        default: Date.now
    },
    hints: {
        type: Number,
        min: 0,
        default: 0
    },
    player: {
        type: String,
        default: 'Anonymous'
    },
    status: {
        type: String,
        uppercase: true,
        enum: ['W', 'L'],
        required: true,
    },
    time: {
        type: Number,
        min: 0,
        required: true
    },
});

gameSchema.plugin(mongoosePaginate);

const Game = mongoose.model('Game', gameSchema);
module.exports = Game;