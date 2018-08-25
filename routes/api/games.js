const express = require('express');
const router = express.Router();

const Game = require('../../models/Game');

const GAMES_FILTER_FIELDS = [
  'hints',
  'status',
  'boardSettings',
  'player',
  'date'
];
const STATS_FILTER_FIELDS = ['boardSettings'];

// -------------------------------
const prepareFilter = (queryParams, whitelist) => {
  const filtered = {};

  // NOTE: case sensitive keys
  Object.keys(queryParams).forEach(key => {
    let value = queryParams[key];
    if (value && whitelist.includes(key)) {
      // Nested objects should contain MongoDB operators (ex gt, lt, in).
      // They need to be prefixed with '$' sign for Mongo to recognize them.
      if (typeof value === 'object' && !Array.isArray(value)) {
        const nested = {};
        const prefix = '$';

        Object.keys(value).forEach(nestedKey => {
          Object.assign(nested, {
            [prefix + nestedKey]: value[nestedKey]
          });
        });

        value = nested;
      }

      Object.assign(filtered, {
        [key]: value
      });
    }
  });

  console.log('createFilter', filtered);
  return filtered;
};

// -------------------------------------------------
// NOTE: it cannot handle sortQuery as object
const prepareSort = (sortQuery, defaultSort) =>
  sortQuery
    ? Array.isArray(sortQuery)
      ? sortQuery.join(' ')
      : sortQuery
    : defaultSort;

// -------------------------------------------------
// NOTE: works only for string and object (not array)
const prepareDate = date => {
  const convert = d => new Date(d).toISOString();

  if (typeof date === 'object') {
    const obj = {};

    Object.keys(date).forEach(key => {
      Object.assign(obj, {
        [key]: convert(date[key])
      });
    });

    return obj;
  }

  return convert(date);
};

// ----------------------------------------------------------------------
// @route   GET api/games
// @desc    Get all games
// @access  Public
router.get('/', (req, res, next) => {
  const queryParams = prepareFilter(req.query, GAMES_FILTER_FIELDS);
  const sort = prepareSort(req.query.sort, '-date');

  if (queryParams.date) {
    Object.assign(queryParams, { date: prepareDate(queryParams.date) });
  }

  const options = { sort };
  if (req.query.limit) {
    Object.assign(options, { limit: +req.query.limit || 10 });
  }

  if (req.query.page) {
    Object.assign(options, { page: +req.query.page || 1 });
  }

  return Game.paginate(queryParams, options)
    .then(result => res.json(result))
    .catch(err => next(err));

  //   Game.find(queryParams)
  //     .sort(sort)
  //     .exec((err, games) => {
  //       if (err) {
  //         next(err);
  //       } else {
  //         res.json(games);
  //       }
  //     });
});

// @route   GET api/games/stats
// @desc    Get stats
// @access  Public
router.get('/stats', (req, res, next) => {
  const queryParams = prepareFilter(req.query, STATS_FILTER_FIELDS);

  Game.aggregate(
    [
      { $match: queryParams },
      { $group: { _id: { status: '$status' }, count: { $sum: 1 } } }
    ],
    (err, result) => {
      if (err) {
        next(err);
      } else {
        res.json(result);
      }
    }
  );
});

// @route   GET api/games/popular-boards
// @desc    Get the most popular played boards
// @access  Public
router.get('/popular-boards', (req, res, next) => {
  const limit = Number(req.query.limit) || 3;

  Game.aggregate(
    [
      {
        $group: { _id: { boardSettings: '$boardSettings' }, count: { $sum: 1 } }
      },
      { $sort: { count: -1 } },
      { $limit: limit }
    ],
    (err, result) => {
      if (err) {
        next(err);
      } else {
        res.json(result);
      }
    }
  );
});

// @route   GET api/games/boards
// @desc    Get all board settings
// @access  Public
router.get('/boards', (req, res, next) => {
  Game.distinct('boardSettings')
    .then(result => res.json(result))
    .catch(err => next(Err));
});

// @route   POST api/games
// @desc    Add a new game
// @access  Public
router.post('/', (req, res, next) => {
  const game = new Game({ ...req.body });

  game
    .save()
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
    })
    .catch(err => next(err));
});

module.exports = router;
