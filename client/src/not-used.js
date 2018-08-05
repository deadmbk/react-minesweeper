// initBoard() {
//     this.cells = Array(this.props.rows * this.props.cols).fill(undefined);
//     for (let i = 0; i < this.cells.length; i++) {
//         this.cells[i] = undefined;
//     }
// }

// addBombsNew(excludedCell) {
//     const bombs = this.props.bombs;
//     const arr = this.cells;

//     let bombCounter = 0;
//     let index;

//     while (bombs > bombCounter) {
//         index = Math.floor(Math.random() * arr.length);

//         if (index === excludedCell) {
//             continue;
//         }

//         if (arr[index] === undefined) {
//             arr[index] = this.bombSign;
//             bombCounter++;
//         }
//     }
// }


// addHintsNew() {
//     const arr = this.cells;

//     let bombCounter;
//     let neighbours;

//     for (let i = 0; i < arr.length; i++) {
        
//         bombCounter = 0;
//         if (arr[i] === this.bombSign) {
//             continue;
//         }

//         neighbours = this.getNeighbours(i);
//         for (let j = 0; j < neighbours.length; j++) {
//             if (arr[neighbours[j]] === this.bombSign) {
//                 bombCounter++;
//             }
//         }

//         arr[i] = bombCounter;
//     }
// }

    // convertToCoordinates(index) {
    //     const rows = Math.floor(index / this.props.rows);
    //     const cols = index - rows * this.props.cols;

    //     return {rows, cols};
    // }

    resetGame(boardSettings) {
        if (this.inProgress() && !window.confirm('The game has not been finished. Are you sure you want to start a new game?')) {
            return;
        }

        // check if provided object is valid
        let validObject;
        if (boardSettings &&
            typeof boardSettings === 'object' &&
            Object.keys(boardSettings).length === 3 &&
            boardSettings.hasOwnProperty('rows') &&
            boardSettings.hasOwnProperty('cols') &&
            boardSettings.hasOwnProperty('bombs')
        ) {
            validObject = true;
        }

        let { rows, cols, bombs } = this.state;
        let reinstantiate;

        if (validObject) {

            // create new array only if at least one of dimensions was changed
            if (boardSettings.rows !== rows || boardSettings.cols !== cols) {
                reinstantiate = true;
            }

            bombs = boardSettings.bombs;
        }

        // create new array based on new dimensions OR get existing one from state
        const arr = reinstantiate ? Array(boardSettings.rows * boardSettings.cols).fill(undefined) : this.state.cells.slice();
        this.initBoard(arr);

        const newState = Object.assign({}, this.state, validObject ? boardSettings : {}, {
            cells: arr,
            bombsLeft: bombs,
            locked: false,
            paused: false,
            finished: false,
            revealed: false,
            timeElapsed: 0
        });

        // destroy timer if set
        this.holdTimer();

        this.setState(newState);
    }