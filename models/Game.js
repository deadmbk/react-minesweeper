const mongoose = require('mongoose');

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
    hintsUsed: {
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

const Game = mongoose.model('Game', gameSchema);
module.exports = Game;