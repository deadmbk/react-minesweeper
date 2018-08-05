import React, { Component } from 'react';
import classNames from 'classnames';
// import update from 'immutability-helper';

import Board from './Board';
import ControlPanel from './ControlPanel';
import InfoPanel from './InfoPanel';
import VisualPanel from './VisualPanel';

import cellState from '../helpers/cellState';

class Game extends Component {

  // clicks = 0;
  // leftButtonDown = false;
  // rightButtonDown = false;

  checkWinner = false;

  // TODO: use enum (maybe)
  bombSign = 'B';

  constructor(props) {
    super(props);

    const arr = Array(this.props.rows * this.props.cols).fill(undefined);
    this.initBoard(arr);

    this.state = {
      cells: arr,
      bombsLeft: this.props.bombs,
      locked: false,
      paused: false,
      finished: false,
      revealed: false, // debugging purposes
      timeElapsed: 0,
      hintsUsed: 0
    };

    this.revealBombs = this.revealBombs.bind(this);
    this.resetGame = this.resetGame.bind(this);
    this.togglePause = this.togglePause.bind(this);
    this.toggleReveal = this.toggleReveal.bind(this);
  }

  componentDidMount() {
    // const cells = document.querySelectorAll('.cell');

    // document.addEventListener('mousedown', e => {
    //     console.log(e.which);
    //     if (e.which == 1) {
    //         this.leftButtonDown = true;
    //     } else if (e.which == 3) {
    //         this.rightButtonDown = true;
    //     }
    // }, false);

    // document.addEventListener('mouseup', e => {
    //     console.log(e.which);
    //     if (e.which == 1) {
    //         this.leftButtonDown = false;
    //     } else if (e.which == 3) {
    //         this.rightButtonDown = false;
    //     }
    // }, false);

    // document.addEventListener('click', e => {
    //     console.log(this.leftButtonDown, this.rightButtonDown);
    // });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.rows !== this.props.rows || prevProps.cols !== this.props.cols) {
      this.resetGame(true);
      return;
    }

    if (prevProps.bombs !== this.props.bombs) {
      this.resetGame();
      return;
    }

    // Revealing cells (through single and double clicks) requires checking if game has been won
    if (this.checkWinner) {
      this.determineWinner();
      this.checkWinner = false;
    }

    // Game should be locked in any of this cases
    const shouldBeLocked = this.state.finished || this.state.paused || this.state.revealed;
    if (this.state.locked !== shouldBeLocked) {
      this.setState({
        locked: shouldBeLocked
      });
    }
  }

  initBoard(arr) {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = {
        // either bomb or number indicating amount of bombs in neighbourhood. This is constant after init and could be placed as simple class field.
        value: undefined,
        mode: cellState.HIDDEN, // state of the cell - hidden, visible, marked as bomb, marked as uncertain
        cssClass: ''            // additional css class for this cell
      }
    }
  }

  // Fills provided array with bombs
  addBombs(arr, excludedCell) {
    const bombs = this.props.bombs;
    // console.log(bombs);

    let bombCounter = 0;
    let index;

    while (bombs > bombCounter) {
      index = Math.floor(Math.random() * arr.length);

      // excludedCell is omitted (useful for ensuring first clicked cells does not contain)
      if (index === excludedCell) {
        continue;
      }

      if (arr[index].value === undefined) {
        arr[index] = Object.assign({}, arr[index], { value: this.bombSign });
        bombCounter++;
      }
    }
  }

  // Fills provided array with hints around bombs
  addHints(arr) {
    let bombCounter;
    let neighbours;

    for (let i = 0; i < arr.length; i++) {

      bombCounter = 0;
      if (arr[i].value === this.bombSign) {
        continue;
      }

      neighbours = this.getNeighbours(i);
      for (let j = 0; j < neighbours.length; j++) {
        if (arr[neighbours[j]].value === this.bombSign) {
          bombCounter++;
        }
      }

      arr[i] = Object.assign({}, arr[i], { value: bombCounter });
    }
  }

  getNeighbours(index) {
    const cols = +this.props.cols;
    const max = +this.props.cols * +this.props.rows;
    const cellElevation = Math.floor(index / cols);

    const neighbours = [
      index - cols - 1, index - cols, index - cols + 1,
      index - 1, index + 1,
      index + cols - 1, index + cols, index + cols + 1
    ];

    // Since board is represented as one-dimensional array, we need to calculate position of the cells in a visual two-dimensional array
    let neighbourElevation; // this is basically a row in which cell is placed in two-dimensional view
    let elevationDiff;      // difference between elevations of two cells

    return neighbours.filter((value, i) => {
      if (value < 0 || value >= max) {
        return false;
      }

      neighbourElevation = Math.floor(value / cols);
      elevationDiff = Math.abs(cellElevation - neighbourElevation);

      // Neighbours on left side and right side of cell should be on the same elevation level therefore their difference should be 0
      if (i === 3 || i === 4) {
        return !elevationDiff;
      }

      // Difference between upper and lower neighbours should be 1 elevation level
      return elevationDiff === 1;
    });
  }

  resetGame(reinstantiate) {
    if (this.inProgress() && !window.confirm('The game has not been finished. Are you sure you want to start a new game?')) {
      return;
    }

    let { rows, cols, bombs } = this.props;

    // create new array based on new dimensions OR get existing one from state
    const arr = reinstantiate ? Array(rows * cols).fill(undefined) : this.state.cells.slice();
    this.initBoard(arr);

    const newState = Object.assign({}, this.state, {
      cells: arr,
      bombsLeft: bombs,
      locked: false,
      paused: false,
      finished: false,
      revealed: false,
      timeElapsed: 0,
      hintsUsed: 0
    });

    // destroy timer if set
    this.holdTimer();

    this.setState(newState);
  }

  startTimer() {
    this.timerID = setInterval(() => this.updateTime(), 1000);
  }

  holdTimer() {
    clearInterval(this.timerID);
    this.timerID = null;
  }

  updateTime() {
    const timeElapsed = this.state.timeElapsed;
    this.setState({
      timeElapsed: timeElapsed + 1
    });
  }

  togglePause() {
    const isPaused = this.state.paused;
    isPaused ? this.startTimer() : this.holdTimer();

    this.setState({
      paused: !isPaused
    });
  }

  toggleReveal() {
    const revealed = this.state.revealed;
    const hints = this.state.hintsUsed;

    this.setState({
      revealed: !revealed,
      hintsUsed: !revealed ? hints + 1 : hints
    });
  }

  // isNumeric(value) {
  //     return !isNaN(value - parseFloat(value));
  // }

  // updateBoardSettings(data) {
  //     if (data) {

  //         let { cols, rows, bombs } = data;
  //         if (!(this.isNumeric(cols) && this.isNumeric(rows) && this.isNumeric(bombs))) {
  //             throw Error('Provided arguments are invalid');
  //         }

  //         let newObj = {
  //             cols: Number(cols),
  //             rows: Number(rows),
  //             bombs: Number(bombs)
  //         }

  //         this.resetGame(newObj);
  //     }
  // }

  updateBombsLeft(bombsLeft) {
    this.setState({
      bombsLeft: this.props.bombs - bombsLeft
    });
  }

  inProgress() {
    return this.state.cells[0] && this.state.cells[0].value !== undefined && !this.state.finished;
  }

  hasBomb(index) {
    return this.state.cells[index].value === this.bombSign;
  }

  setCellMode(index, mode, afterStateChangedCallback) {
    this.setState((prevState, props) => {

      const arr = prevState.cells.slice();
      arr[index] = Object.assign({}, arr[index], { mode: mode });

      return { cells: arr }
    }, afterStateChangedCallback);

    // Alternative version using immutability-helper library
    //
    // this.setState({
    //     cells: update(this.state.cells, {[index]: {mode: {$set: mode}}})
    // });
  }

  // Reveals all cells with bombs and highlights cells uncorrectly marked as bomb
  revealBombs() {
    const arr = this.state.cells.slice();
    let mode;

    for (let i = 0; i < arr.length; i++) {

      mode = arr[i].mode;

      // TODO: if game is won, bombs are not revealed
      if (this.hasBomb(i) && mode !== cellState.MARKED_AS_BOMB) {
        arr[i] = Object.assign({}, arr[i], { mode: cellState.VISIBLE });
      }

      if (!this.hasBomb(i) && mode === cellState.MARKED_AS_BOMB) {
        arr[i] = Object.assign({}, arr[i], {
          value: this.bombSign,
          mode: cellState.VISIBLE,
          cssClass: 'marked-invalid'
        });
      }
    }

    this.setState({ cells: arr });
  }

  determineWinner() {
    // Determining if game has been won - amount of unrevealed cells should be equal to number of bombs on the field
    const hiddenCellsCount = this.state.cells.filter(cell => cell.mode !== cellState.VISIBLE).length;

    if (hiddenCellsCount === this.props.bombs) {
      const aftermath = () => {
        this.handleWonGame(this.revealBombs);
      }

      this.finishGame(aftermath);
    }
  }

  revealEmptyArea(index) {
    const arr = this.state.cells.slice();
    const toVisit = [index];   // cells to visit by algorithm
    const visited = [];        // cells already visited

    let elIndex;

    do {
      elIndex = toVisit.shift();
      arr[elIndex] = Object.assign({}, arr[elIndex], { mode: cellState.VISIBLE });

      if (arr[elIndex].value === 0) {

        // get only hidden neighbours which has not been visited AND added to queue yet
        this.getNeighbours(elIndex).forEach(val => {
          if (arr[val].mode === cellState.HIDDEN && !visited.includes(val) && !toVisit.includes(val)) {
            toVisit.push(val);
          }
        });
      }

      visited.push(elIndex);
      // console.log(`toVisit: ${toVisit}`);
    } while (toVisit.length);

    this.checkWinner = true;
    this.setState({ cells: arr });
  }

  // Finish the game and call an additional function if passed
  finishGame(aftermathCallback) {
    this.setState({ finished: true }, aftermathCallback);
    this.holdTimer();
  }

  getGameStatsObject(status) {
    return {
      status: status,
      time: this.state.timeElapsed,
      hintsUsed: this.state.hintsUsed,
      player: 'mbk' // TODO: make input for player
    }
  }

  // This is a template for lost game - show confirm dialog and call an additional function if passed
  handleLostGame(callback) {

    const game = this.getGameStatsObject('l');
    this.props.onFinishedGame(game);

    const msg = 'You have lost the game. Do you want to start a new game?';
    if (window.confirm(msg)) {
      this.resetGame();
    } else if (callback && callback instanceof Function) {
      // typeof callback === 'function'
      callback();
    }
  }

  // This is a template for won game - show alert and call an additional function if passed
  handleWonGame(callback) {

    const game = this.getGameStatsObject('w');
    this.props.onFinishedGame(game);

    alert('You have won the game!');
    if (callback && typeof callback === Function) {
      callback();
    }
  }

  handleClick(index) {
    if (this.state.locked) {
      return;
    }

    // let timeout;

    // this.clicks++;
    // if (this.clicks === 1) {
    //     timeout = setTimeout(() => {
    //         // console.log(this.clicks);
    //         if (this.clicks === 1) {
    //         } else {
    //             this.handleDoubleClick(index);
    //         }

    //         this.clicks = 0;
    //     }, 300);
    // }

    // console.log(arr);
    // console.log(this.leftButtonDown && this.rightButtonDown);


    const { mode } = this.state.cells[index];
    let { value } = this.state.cells[index];

    // setState synchronization: this HAS TO occur after first click (which initializes board)
    const handleClick = () => {

      // Click works only when clicked cell is hidden
      if (mode === cellState.HIDDEN || mode === cellState.MARKED_AS_UNCERTAIN) {

        if (value === 0) {
          this.revealEmptyArea(index);
        } else {

          // Set cell as visible
          this.setCellMode(index, cellState.VISIBLE);

          // Check if cell has bomb
          if (this.hasBomb(index)) {

            const aftermath = () => {
              this.handleLostGame(() => {
                const arr = this.state.cells.slice();

                // add additional style to clicked cell (which has bomb)
                arr[index] = Object.assign({}, arr[index], { cssClass: 'clicked-bomb' });

                this.setState({ cells: arr }, this.revealBombs);
              });
            }

            this.finishGame(aftermath);
          } else {
            this.checkWinner = true;
          }
        }
      }
    };

    // first click - init cells
    if (value === undefined) {
      const arr = this.state.cells.slice();

      this.addBombs(arr, index);
      this.addHints(arr);

      this.setState({ cells: arr }, () => {
        value = arr[index].value;
        handleClick();
      });

      this.startTimer();
    } else {
      handleClick();
    }
  }

  /*
      Revealing cells (on double click) in neighbourhood can only be performed on visible cell and only when number of marked cells 
      matches value in clicked cell. If any of cells contains a bomb AND was not marked as such, the game is lost. 
      In this case, the cell is highlighted. Cells that have been marked as bombs incorrectly are also highlighted (different way).
  */
 // TODO: if neighour is empty cell, it is not revealed (sometimes)
  handleDoubleClick(index) {
    const { value, mode } = this.state.cells[index];

    // This operation can only be performed on visible cells.
    // NOTE: current implementation fires click event first making the cell visible before reaching this code
    if (mode !== cellState.VISIBLE) {
      return;
    }

    const neighbours = this.getNeighbours(index);

    // If all neighbours are revealed or marked as bombs, there is nothing more to do in this handler
    if (!neighbours.filter(cellIndex => this.state.cells[cellIndex].mode === cellState.HIDDEN).length) {
      return;
    }

    // Amount of neighbours marked as bombs should be equal to the value of main cell
    let neighboursMarkedAsBomb = 0;
    neighbours.forEach(val => {
      if (this.state.cells[val].mode === cellState.MARKED_AS_BOMB) {
        neighboursMarkedAsBomb++;
      }
    });

    if (neighboursMarkedAsBomb === value) {

      const arr = this.state.cells.slice();
      let isGameLost = false;
      const emptyCells = [];

      neighbours.forEach(val => {

        // Any cell which is not marked as bomb should be revealed...
        if (arr[val].mode !== cellState.MARKED_AS_BOMB) {

          if (arr[val].value === 0) {
            emptyCells.push(val);
          } else {

            // ...but if it contains a bomb, highlight it and end the game
            if (this.hasBomb(val)) {
              isGameLost = true;
            }

            arr[val] = Object.assign({}, arr[val], {
              mode: cellState.VISIBLE,
              cssClass: classNames(
                arr[val].cssClass, { 'clicked-bomb': this.hasBomb(val) })
            });
          }
        }
      });

      this.setState({ cells: arr }, () => {

        // revealEmptyArea modifies state on its own, so its execution is delayed AFTER dealing with other cells 
        emptyCells.forEach(val => {
          this.revealEmptyArea(val);
        });

        if (isGameLost) {
          this.finishGame(this.handleLostGame(this.revealBombs));
        } else {
          this.checkWinner = true;
        }
      });
    }
  }

  handleRightClick(index, event) {
    event.preventDefault();

    if (this.state.locked) {
      return;
    }

    const updateBombs = () => {
      const bombsLeft = this.state.cells.filter(cell => cell.mode === cellState.MARKED_AS_BOMB).length;
      this.updateBombsLeft(bombsLeft);
    };

    const { mode } = this.state.cells[index];

    switch (mode) {
      case cellState.HIDDEN: this.setCellMode(index, cellState.MARKED_AS_BOMB, updateBombs); break;
      case cellState.MARKED_AS_BOMB: this.setCellMode(index, cellState.MARKED_AS_UNCERTAIN, updateBombs); break;
      case cellState.MARKED_AS_UNCERTAIN: this.setCellMode(index, cellState.HIDDEN); break;
      default:
    }
  }

  render() {
    return (
      <div className='game'>
        <div className="panels">
          <InfoPanel timeElapsed={this.state.timeElapsed}
            bombsLeft={this.state.bombsLeft}
            rows={this.props.rows}
            cols={this.props.cols}
            bombs={this.props.bombs}
            inProgress={this.inProgress()}
            onSettingsUpdate={data => this.props.onSettingsUpdate(data)} />
          <ControlPanel
            onStartNewGame={this.resetGame}
            onTogglePause={this.togglePause}
            onToggleReveal={this.toggleReveal}
            inProgress={this.inProgress()}
            paused={this.state.paused}
            revealed={this.state.revealed} />
          <VisualPanel />
        </div>

        <Board cells={this.state.cells}
          rows={this.props.rows}
          cols={this.props.cols}
          showAll={this.state.revealed}
          bombSign={this.bombSign}
          onClick={(index, e) => this.handleClick(index, e)}
          onDblClick={(index, e) => this.handleDoubleClick(index, e)}
          onContextMenu={(index, e) => this.handleRightClick(index, e)} />
      </div>
    )
  }
}

export default Game;