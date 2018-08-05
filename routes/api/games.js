const express = require('express');
const router = express.Router();

const Game = require('../../models/Game');

// @route   GET api/games
// @desc    Get all games
// @access  Public
router.get('/', (req, res, next) => {

    const queryParams = {};
    const sortQuery = req.query.sort;
    let sort = { date: -1 };

    if (sortQuery !== undefined) {
        
        sort = {};

        sortQuery.split(',').forEach(element => {
            const sortParts = element.split(':');

            const sortField = sortParts[0].toLowerCase().trim();
            let sortOrder;

            if (sortParts.length === 1) {
                sortOrder = 1;
            } else {
                const sortValue = sortParts[1].toLowerCase().trim();
                
                switch (sortValue) {
                    case 'asc':
                        sortOrder = 1;
                        break;
                    case 'desc':
                        sortOrder = -1;
                        break;
                    default:
                        return;
                }
            }

            Object.assign(sort, 
                { [sortField]: sortOrder }
            );
        });
    }

    if (req.query.hintsUsed !== undefined) {
        Object.assign(queryParams, { hintsUsed: req.query.hintsUsed });
    }

    if (req.query.status !== undefined) {
        Object.assign(queryParams, { status: req.query.status });
    }

    if (req.query.player !== undefined) {
        Object.assign(queryParams, { player: req.query.player });
    }

    if (req.query.boardSettings !== undefined) {
        Object.assign(queryParams, { boardSettings: req.query.boardSettings });
    }

    Game.find(queryParams)
        .sort(sort)
        .exec((err, games) => {
        if (err) {
            next(err);
        } else {
            res.json(games);
        }
    });
});

router.get('/stats', (req, res, next) => {

    const queryParams = {};
    if (req.query.boardSettings !== undefined) {
        Object.assign(queryParams, { boardSettings: req.query.boardSettings });
    }

    Game.aggregate([
        { $match: queryParams },
        { $group: { _id: { status: '$status' }, count: { $sum: 1 } } }
    ], (err, result) => {
        if (err) {
            next(err);
        } else {
            res.json(result);
        }
    });
});

router.get('/boards', (req, res, next) => {

    Game.distinct('boardSettings')
        .then(result => res.json(result))
        .catch(err => next(Err));

    // Game.aggregate([
    //     {
    //         $group: { _id: '$boardSettings'}
    //     }
    // ], (err, result) => {
    //     if (err) {
    //         next(err);
    //     } else {
    //         res.json(result);
    //     }
    // })
});

// @route   POST api/games/
// @desc    Add a new game
// @access  Public
router.post('/', (req, res, next) => {
    const game = new Game({ ...req.body });

    game.save()
        .then(game => res.json(game))
        .catch(err => next(err));
});

// @route   DELETE api/games/:id
// @desc    Delete a game
// @access  Public
router.delete('/:id', (req, res, next) => {
    Game.findById(req.params.id)
        .then(game => {
            if (game === null) {
                const err = new Error('Game not found.');
                err.statusCode = 404;

                return next(err);
            }

            game.remove().then(() => res.json({}));
        }).catch(err => next(err));
});

module.exports = router;