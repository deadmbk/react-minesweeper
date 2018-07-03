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

