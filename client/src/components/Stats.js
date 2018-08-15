import React, { Component } from 'react'

export default class Stats extends Component {


  // Po co statsy trzymać w state? Może po to zeby select mógł zrobić rerender
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

  handleBoardSelectChange(board) {
    this.getStats(board.boardSettings);
  }

  render() {
    return (
      <div>

        <BoardSelect
          value={this.state.stats.boardSettings}
          onValueChange={this.handleBoardSelectChange} />

        <div>Games played: {gamesPlayed}</div>
        <div>Games won: {gamesWon}</div>
        <div>Games lost: {gamesLost}</div>

        <div>Games won (percentage): {(gamesWon * 100 / gamesPlayed).toFixed(2)}%</div>
      </div>
    )
  }
}
