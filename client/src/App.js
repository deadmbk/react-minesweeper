import React, { Component } from 'react';
import { Tabs, Tab } from 'react-bootstrap';

import Game from './components/Game';
import HistoryTable from './components/HistoryTable';
import HistoryFilters from './components/HistoryFilters';
import BoardSelect from './components/BoardSelect';

import { addGame, getAllGames, getBoards, getStats } from './services/gameService';

import './App.css';

const GAME_CONFIG = {
  rows: 20,
  cols: 20,
  bombs: 70
}

export default class App extends Component {

  defaultSortConfig = { date: 'desc' };

  constructor(props) {
    super(props);

    this.state = {
      ...GAME_CONFIG,
      history: [],
      boardSettingsList: [],
      filters: {
        status: '',
        boardSettings: '',
        noHintsUsed: false
      },
      stats: {
        boardSettings: '',
        gamesLost: 0,
        gamesWon: 0
      },
      sort: this.defaultSortConfig,
      currentBoardSettings: '',
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
    getBoards()
      .then(result => this.setState({ boardSettingsList: result }))
      .catch(err => console.log(err));

    const current = this.getBoardSettingsAsString();
    this.setState({
      currentBoardSettings: current,
      filters: { ...this.state.filters, boardSettings: current }
    });
  }

  componentDidUpdate(props, state) {
    if (state.filters !== this.state.filters || state.sort !== this.state.sort) {
      this.getHistory();
    }

    if (state.currentBoardSettings !== this.state.currentBoardSettings) {
      this.getStats(this.state.currentBoardSettings);
    }
  }

  getBoardSettingsAsString() {
    return `${this.state.rows}x${this.state.cols}x${this.state.bombs}`;
  }

  resetFilters() {
    const initFilters = {
      boardSettings: this.getBoardSettingsAsString(),
      status: '',
      noHintsUsed: false
    }

    this.setState({
      filters: initFilters,
      sort: this.defaultSortConfig
    });
  }

  getStats(boardSettings) {

    const searchParams = {};
    if (boardSettings && boardSettings !== '') {
      Object.assign(searchParams, { boardSettings: boardSettings });
    }

    getStats(searchParams)
      .then(result => {
        console.log(result);

        const stats = { boardSettings: boardSettings, gamesLost: 0, gamesWon: 0 };
        result.forEach(item => {

          if (item._id.status === 'L') {
            stats['gamesLost'] = item.count;
          }

          if (item._id.status === 'W') {
            stats['gamesWon'] = item.count;
          }
        });

        console.log(stats);
        this.setState({
          stats: stats
        });
      })
      .catch(err => console.log(err));
  }

  getHistory() {
    const filters = { ...this.state.filters };

    // Remove all empty filters
    Object.keys(filters).forEach(key => {
      if (!filters[key] || filters[key] === undefined || filters[key] === '') {
        delete filters[key];
      }
    });

    if (filters['noHintsUsed']) {
      delete filters['noHintsUsed'];
      Object.assign(filters, {
        hintsUsed: 0
      })
    }

    const searchParams = { ...filters };

    // Prepare sort query
    if (this.state.sort) {

      // Add sort object to searchParams
      Object.assign(searchParams, {
        sort: { ...this.state.sort }
      });
    }

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
    }
  }

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

      this.setState(newObj, () => {
        const settings = this.getBoardSettingsAsString();
        const settingsList = this.state.boardSettingsList.slice();
        if (!settingsList.includes(settings)) {
          settingsList.push(settings);
        }

        this.setState({
          currentBoardSettings: settings,
          boardSettingsList: settingsList
        });
      });
    }
  }

  handleFinishedGame(gameStats) {
    const game = {
      ...gameStats,
      boardSettings: this.state.currentBoardSettings
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
        </Tab>
        <Tab
          eventKey={2}
          title="History">
          <HistoryFilters
            onFilterChange={this.handleFilterChange}
            filters={this.state.filters}
            boardSettingsList={this.state.boardSettingsList}
            currentBoardSettings={this.state.currentBoardSettings} />
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
              list={this.state.boardSettingsList} 
              current={this.state.currentBoardSettings} 
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
