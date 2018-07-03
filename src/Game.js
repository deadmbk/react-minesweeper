import React from 'react';
// import update from 'immutability-helper';

import { Button, Panel, Form, FormGroup, FormControl, ControlLabel, Modal, Col, Glyphicon, Tooltip, OverlayTrigger } from 'react-bootstrap';

import './Game.css';
import bombIcon from './img/bomb-icon.png';
import flagIcon from './img/flag-icon.png';
import questionMarkIcon from './img/question-mark-icon.png';
import timeIcon from './img/time-icon.png';

const cellState = {
    HIDDEN: 'HIDDEN',
    VISIBLE: 'VISIBLE',
    MARKED_AS_BOMB: 'MARKED_AS_BOMB',
    MARKED_AS_UNCERTAIN: 'MARKED_AS_UNCERTAIN'
}

const Icon = props => <img className="icon" src={props.src} alt={props.alt ? props.alt : ''} />;

class Cell extends React.Component {
    render() {
        let classname = 'cell';
        if (this.props.cssClass) {
            classname += ' ' + this.props.cssClass;
        }

        return (
            <button className={classname}
                onContextMenu={e => this.props.onContextMenu(e)}
                onDoubleClick={e => this.props.onDblClick(e)}
                onClick={e => this.props.onClick(e)}>
                {this.props.value}
            </button>);
    }
}

class Board extends React.Component {

    renderSingleCell(index) {
        let { value, mode, cssClass } = this.props.cells[index];

        const cssClasses = [cssClass];

        switch (mode) {
            case cellState.MARKED_AS_BOMB: value = <Icon src={flagIcon} alt="Flag" />; break;
            case cellState.MARKED_AS_UNCERTAIN: value = <Icon src={questionMarkIcon} alt="Uncertain" />; break;
            case cellState.HIDDEN:
                if (!this.props.showAll) {
                    value = '';
                    break;
                }
            default:
                cssClasses.push('cell-revealed');

                if (value === this.props.bombSign) {
                    value = <Icon src={bombIcon} alt="Bomb" />
                    cssClasses.push('cell-bomb')
                } else if (value === 0) {
                    value = '';
                } else if (value > 0 && value <= 8) {
                    cssClasses.push('cell-' + value);
                }
        }

        return (
            <Cell
                key={index}
                cssClass={cssClasses.join(' ')}
                value={value}
                onClick={e => this.props.onClick(index, e)}
                onDblClick={e => this.props.onDblClick(index, e)}
                onContextMenu={e => this.props.onContextMenu(index, e)} />
        )
    }

    render() {
        const rows = this.props.rows;
        const cols = this.props.cols;
        const board = [];

        let k = 0;
        let row = [];

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                row.push(this.renderSingleCell(k++));
            }

            board.push(<div key={k} className='row'>{row}</div>);
            row = [];
        }

        return (
            <div className="board">
                {board}
            </div>
        )

    }
}

class Game extends React.Component {

    // cells = [];
    // defaultRows = 20;
    // defaultCols = 20;
    // defaultBombs = 70;

    // clicks = 0;
    // leftButtonDown = false;
    // rightButtonDown = false;

    timerID;

    checkWinner = false;

    bombSign = 'B';
    markedAsBombSign = 'T';
    markedAsUncertain = 'U';

    constructor(props) {
        super(props);

        const arr = Array(this.props.rows * this.props.cols).fill(undefined);
        this.initBoard(arr);

        this.state = {
            cols: this.props.cols,
            rows: this.props.rows,
            bombs: this.props.bombs,
            cells: arr,
            bombsLeft: this.props.bombs,
            locked: false,
            paused: false,
            finished: false,
            revealed: false, // debugging purposes
            timeElapsed: 0
        };

        this.revealBombs = this.revealBombs.bind(this);
        this.startNewGame = this.startNewGame.bind(this);
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

    componentDidUpdate() {

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
        const bombs = this.state.bombs;
        console.log(bombs);

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
        const cols = +this.state.cols;
        const max = +this.state.cols * +this.state.rows;
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

    startNewGame() {
        if (this.inProgress() && !window.confirm('The game has not been finished. Are you sure you want to start a new game?')) {
            return;
        }

        const arr = this.state.cells.slice();
        this.initBoard(arr);

        // destroy timer if set
        this.holdTimer();

        this.setState({
            cells: arr,
            bombsLeft: this.state.bombs,
            locked: false,
            paused: false,
            finished: false,
            revealed: false,
            timeElapsed: 0
        });
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
        this.setState({
            revealed: !revealed
        });
    }

    // TODO: better validation approach
    updateBoardSettings(data) {
        if (data) {
            const cols = data['columns'].trim();
            const rows = data['rows'].trim();
            const bombs = data['bombs'].trim();

            if (cols.length && !isNaN(cols)) {
                this.setState({ cols: +cols });
            }

            if (rows.length && !isNaN(rows)) {
                this.setState({ rows: +rows });
            }

            if (bombs.length && !isNaN(bombs)) {
                this.setState({
                    bombs: +bombs,
                    bombsLeft: +bombs
                });
            }

            // TODO: changes to startInitGame so no need to double initBoard
            this.setState(prevState => {
                const arr = Array(prevState.rows * prevState.cols).fill(undefined);
                this.initBoard(arr);
                return { cells: arr };
            }, () => this.startNewGame());
        }
    }

    updateBombsLeft(bombsLeft) {
        this.setState({
            bombsLeft: this.state.bombs - bombsLeft
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
            if (this.hasBomb(i) && mode !== cellState.MARKED_AS_BOMB) {
                arr[i] = Object.assign({}, arr[i], { mode: cellState.VISIBLE });
            }

            if (!this.hasBomb(i) && mode === cellState.MARKED_AS_BOMB) {
                arr[i] = Object.assign({}, arr[i], { cssClass: 'marked-invalid' });
            }
        }

        this.setState({ cells: arr });
    }

    determineWinner() {
        // Determining if game has been won - amount of unrevealed cells should be equal to number of bombs on the field
        const hiddenCellsCount = this.state.cells.filter(cell => cell.mode !== cellState.VISIBLE).length;

        if (hiddenCellsCount === this.state.bombs) {
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

    // This is a template for lost game - show confirm dialog and call an additional function if passed
    handleLostGame(callback) {
        const msg = 'You have lost the game. Do you want to start a new game?';
        if (window.confirm(msg)) {
            this.startNewGame();
        } else if (callback && callback instanceof Function) {
            callback();
        }
    }

    // This is a template for won game - show alert and call an additional function if passed
    handleWonGame(callback) {
        alert('You have won the game!');
        if (callback && callback instanceof Function) {
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
            let cssClass;
            const emptyCells = [];

            neighbours.forEach(val => {

                // Any cell which is not marked as bomb should be revealed...
                if (arr[val].mode !== cellState.MARKED_AS_BOMB) {

                    if (arr[val].value === 0) {
                        emptyCells.push(val);
                    } else {

                        // ...but if it contains a bomb, highlight it and end the game
                        if (this.hasBomb(val)) {
                            cssClass = 'clicked-bomb';
                            isGameLost = true;
                        }

                        // TODO: concat cssClass
                        arr[val] = Object.assign({}, arr[val], {
                            mode: cellState.VISIBLE,
                            cssClass: cssClass ? cssClass : ''
                        });

                        cssClass = '';
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
                        rows={this.state.rows}
                        cols={this.state.cols}
                        bombs={this.state.bombs}
                        inProgress={this.inProgress()}
                        onSettingsUpdate={data => this.updateBoardSettings(data)} />
                    <ControlPanel
                        onStartNewGame={this.startNewGame}
                        onTogglePause={this.togglePause}
                        onToggleReveal={this.toggleReveal}
                        inProgress={this.inProgress()}
                        paused={this.state.paused}
                        revealed={this.state.revealed} />
                </div>

                <Board cells={this.state.cells}
                    rows={this.state.rows}
                    cols={this.state.cols}
                    showAll={this.state.revealed}
                    bombSign={this.bombSign}
                    onClick={(index, e) => this.handleClick(index, e)}
                    onDblClick={(index, e) => this.handleDoubleClick(index, e)}
                    onContextMenu={(index, e) => this.handleRightClick(index, e)} />


            </div>
        )
    }
}

class ControlPanel extends React.Component {
    render() {

        const pauseButton = this.props.inProgress && <Button onClick={e => this.props.onTogglePause()}>{this.props.paused ? 'Resume game' : 'Pause game'}</Button>;
        const revealButon = this.props.inProgress && <Button onClick={e => this.props.onToggleReveal()}>{this.props.revealed ? 'Hide cells' : 'Show cells'}</Button>;

        return (
            <Panel className="control-panel">
                <Panel.Heading>
                    <Panel.Title componentClass="h2">Controls</Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    <Button bsStyle="primary" onClick={e => this.props.onStartNewGame()}>New Game</Button>
                    {pauseButton}
                    {revealButon}
                </Panel.Body>
            </Panel>
        )
    }
}

const InfoItem = props => {

    let label;
    if (props.icon) {
        label = (
            <span>
                <Icon src={props.icon} alt={props.alt ? props.alt : ''} />
                <span>{props.label}:</span>
            </span>
        );
    } else {
        label = <span>{props.label}:</span>;
    }

    return (
        <div className="info-item">
            {label}
            <span>{props.value}</span>
        </div>
    )
}

class SettingsModal extends React.Component {

    values;

    constructor(props) {
        super(props);

        this.state = {
            columns: "",
            rows: "",
            bombs: ""
        };

        this.close = this.close.bind(this);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    close() {
        this.props.onModalClose();
    }

    handleChange(e) {
        const target = e.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    handleSubmit(e) {
        e.preventDefault();

        this.props.onModalClose(this.state);
        this.reset();
    }

    reset() {
        this.setState({
            columns: "",
            rows: "",
            bombs: ""
        });
    }

    render() {
        return (
            <Modal show={this.props.show} onHide={this.close} bsSize="small">
                <Modal.Header closeButton>
                    <Modal.Title>Edit board options</Modal.Title>
                </Modal.Header>

                <Form horizontal onSubmit={this.handleSubmit}>
                    <Modal.Body>
                        <FormGroup controlId="columns" bsSize="sm">
                            <Col componentClass={ControlLabel} sm={4}>Columns</Col>
                            <Col sm={8}>
                                <FormControl type="number" name="columns" value={this.state.cols} placeholder="Insert number of columns" onChange={this.handleChange} />
                            </Col>
                        </FormGroup>

                        <FormGroup controlId="rows" bsSize="sm">
                            <Col componentClass={ControlLabel} sm={4}>Rows</Col>
                            <Col sm={8}>
                                <FormControl type="text" name="rows" value={this.state.rows} placeholder="Insert number of rows" onChange={this.handleChange} />
                            </Col>
                        </FormGroup>

                        <FormGroup controlId="bombs" bsSize="sm">
                            <Col componentClass={ControlLabel} sm={4}>Bombs</Col>
                            <Col sm={8}>
                                <FormControl type="text" name="bombs" value={this.state.bombs} placeholder="Insert number of bombs" onChange={this.handleChange} />
                            </Col>
                        </FormGroup>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button onClick={this.close}>Close</Button>
                        <Button bsStyle="primary" type="submit">Save</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        );
    }
}

class InfoPanel extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            show: false
        }

        this.showSettingsModal = this.showSettingsModal.bind(this);
    }

    showSettingsModal(e) {
        e.preventDefault();

        this.setState({
            show: true
        });
    }

    closeSettingsModal(data) {
        if (data !== undefined) {
            this.props.onSettingsUpdate(data);
        }

        this.setState({
            show: false
        });
    }

    render() {

        const tooltip = <Tooltip placement="bottom" className="in" id="disabled-info-tooltip">You can edit only when game has not been started.</Tooltip>;
        const settingsButton = (
            <button className="edit-settings-button" onClick={this.showSettingsModal} disabled={this.props.inProgress ? 'disabled' : ''}>
                <Glyphicon glyph="cog" />
                <span>Edit settings</span>
            </button>
        );

        return (
            <Panel className="info-panel" bsStyle="info">
                <Panel.Heading>
                    <Panel.Title componentClass="h2">Info</Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    <InfoItem label="Dimensions" value={this.props.cols + 'x' + this.props.rows} />
                    <InfoItem label="Bombs" value={this.props.bombs} />

                    {this.props.inProgress ? (
                        <OverlayTrigger placement="bottom" overlay={tooltip}>{settingsButton}</OverlayTrigger>
                    ) : settingsButton}

                    <InfoItem label="Time" value={this.props.timeElapsed + 's'} icon={timeIcon} alt="Time elapsed" />
                    <InfoItem label="Bombs left" value={this.props.bombsLeft} icon={bombIcon} alt="Bombs left" />

                    <SettingsModal show={this.state.show} onModalClose={(data) => this.closeSettingsModal(data)} />
                </Panel.Body>
            </Panel>
        )
    }
}

export default Game;