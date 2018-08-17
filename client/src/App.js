import React, { Component } from 'react';
import { Tabs, Tab } from 'react-bootstrap';

import Game from './components/Game';
import HistoryTable from './components/HistoryTable';
import HistoryFilters from './components/HistoryFilters';
import BoardSelect from './components/BoardSelect';

import { connect } from 'react-redux';

import { getBoardConfigs, changeCurrentBoardConfig } from './actions/boardConfigActions';

import { addGame, getAllGames, getStats } from './services/gameService';

import { convertSettingsToString } from './helpers/utils';

import './App.css';

const GAME_CONFIG = {
  rows: 20,
  cols: 20,
  bombs: 70
}

class App extends Component {

  defaultSortConfig = {
    date: 'desc'
  };

  defaultFilterConfig = {
    status: '',
    boardSettings: this.props.currentBoardConfig,
    noHintsUsed: false
  };

  defaultStatsConfig = {
    boardSettings: this.props.currentBoardConfig,
    gamesLost: 0,
    gamesWon: 0
  };

  constructor(props) {
    super(props);

    this.state = {
      ...GAME_CONFIG,
      history: [],
      filters: this.defaultFilterConfig,
      stats: this.defaultStatsConfig,
      sort: this.defaultSortConfig,
      tabKey: 1
    }

    this.handleFinishedGame = this.handleFinishedGame.bind(this);
    this.handleBoardSettingsUpdate = this.handleBoardSettingsUpdate.bind(this);
    this.handleTabSelection = this.handleTabSelection.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleBoardSelectChange = this.handleBoardSelectChange.bind(this);
    this.handleSort = this.handleSort.bind(this);
    this.getHistory = this.getHistory.bind(this);
  }

  componentDidMount() {
    this.props.getBoardConfigs();
    this.getStats();
  }

  componentDidUpdate(props, state) {
    if (state.filters !== this.state.filters || state.sort !== this.state.sort) {
      this.getHistory();
    }
  }

  resetFilters() {
    this.setState({
      filters: {
        ...this.defaultFilterConfig,
        boardSettings: this.props.currentBoardConfig
      },
      sort: this.defaultSortConfig
    });
  }

  getStats(boardSettings) {
    if (boardSettings === undefined) {
      boardSettings = this.props.currentBoardConfig;
    }

    const searchParams = {};
    if (boardSettings !== '') {
      Object.assign(searchParams, { boardSettings: boardSettings });
    }

    getStats(searchParams)
      .then(result => {
        const stats = { ...this.defaultStatsConfig, boardSettings: boardSettings };
        result.forEach(item => {

          if (item._id.status === 'L') {
            stats['gamesLost'] = item.count;
          }

          if (item._id.status === 'W') {
            stats['gamesWon'] = item.count;
          }
        });

        this.setState({
          stats: stats
        });
      })
      .catch(err => console.log(err));
  }

  getHistory() {
    const filters = { ...this.state.filters };

    // Empty status - get games with any status
    if (filters.status === '') {
      delete filters['status'];
    }

    // Empty settings - get games with any settings
    if (filters.boardSettings === '') {
      delete filters['boardSettings'];
    }

    // If noHintsUsed is checked then get all games which have field hintsUsed == 0
    if (filters.noHintsUsed) {
      Object.assign(filters, { hintsUsed: 0 });
    }

    // Delete this entry since API does not use it
    delete filters['noHintsUsed'];

    // Combine filters and sort into search params
    const searchParams = {
      ...filters,
      sort: { ...this.state.sort }
    };

    getAllGames(searchParams)
      .then(games => this.setState({ history: games }))
      .catch(err => console.log(err));
  }

  isNumeric(value) {
    return !isNaN(value - parseFloat(value));
  }

  handleFilterChange(filterEntry) {
    const newFilters = { ...this.state.filters, ...filterEntry };
    this.setState({
      filters: newFilters
    });
  }

  handleTabSelection(key) {
    this.setState({ tabKey: key });

    if (key === 2) {
      this.resetFilters();
    } else if (key === 3) {
      this.getStats();
    }
  }

  // TODO: move it to Game
  handleBoardSettingsUpdate(data) {
    if (data) {

      let { cols, rows, bombs } = data;
      if (!(this.isNumeric(cols) && this.isNumeric(rows) && this.isNumeric(bombs))) {
        throw Error('Provided arguments are invalid');
      }

      let newObj = {
        cols: Number(cols),
        rows: Number(rows),
        bombs: Number(bombs)
      }

      const settings = convertSettingsToString(newObj);
      this.props.changeCurrentBoardConfig(settings);

      this.setState(newObj);
    }
  }

  handleFinishedGame(gameStats) {
    const game = {
      ...gameStats,
      boardSettings: this.props.currentBoardConfig
    }

    addGame(game)
      .then(savedGame => {
        const history = this.state.history.slice();
        history.unshift(savedGame);

        this.setState({
          history: history
        });
      })
      .catch(err => console.log('Error has occured', err));
  }

  handleSort(column) {
    const sort = this.state.sort;
    const order = sort !== null && sort.hasOwnProperty(column) ? sort[column] === 'asc' ? 'desc' : 'asc' : 'asc';
    const newSort = { [column]: order };

    this.setState({ sort: newSort });
  }

  handleBoardSelectChange(board) {
    this.getStats(board.boardSettings);
  }

  render() {
    const gamesPlayed = this.state.stats.gamesLost + this.state.stats.gamesWon;
    const gamesWon = this.state.stats.gamesWon;
    const gamesLost = this.state.stats.gamesLost;

    return (
      <Tabs
        activeKey={this.state.tabKey}
        onSelect={this.handleTabSelection}
        id="app-tabs">
        <Tab
          eventKey={1}
          title="Game">
          <Game
            rows={this.state.rows}
            cols={this.state.cols}
            bombs={this.state.bombs}
            onFinishedGame={this.handleFinishedGame}
            onSettingsUpdate={this.handleBoardSettingsUpdate} />

          <div>Icons made by <a href="https://www.flaticon.com/authors/smashicons" title="Smashicons">Smashicons</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
        </Tab>
        <Tab
          eventKey={2}
          title="History">
          <HistoryFilters
            onFilterChange={this.handleFilterChange}
            filters={this.state.filters} />
          <div>Result found: {this.state.history.length}</div>
          {
            !this.state.history.length &&
            <span className="no-results">No results found.</span>
          }
          {
            this.state.history.length !== 0 &&
            <HistoryTable
              history={this.state.history}
              onSort={this.handleSort}
              sort={this.state.sort} />
          }
        </Tab>
        <Tab
          eventKey={3}
          title="Stats">

          <div>

            <BoardSelect
              value={this.state.stats.boardSettings}
              onValueChange={this.handleBoardSelectChange} />

            <div>Games played: {gamesPlayed}</div>
            <div>Games won: {gamesWon}</div>
            <div>Games lost: {gamesLost}</div>

            <div>Games won (percentage): {(gamesWon * 100 / gamesPlayed).toFixed(2)}%</div>
          </div>

        </Tab>
      </Tabs>
    )
  }
}

const mapStateToProps = state => {
  return {
    currentBoardConfig: state.boardConfig.currentBoardConfig
  }
};

const mapDispatchToProps = dispatch => ({
  getBoardConfigs: () => dispatch(getBoardConfigs()),
  changeCurrentBoardConfig: boardConfig => dispatch(changeCurrentBoardConfig(boardConfig))
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
