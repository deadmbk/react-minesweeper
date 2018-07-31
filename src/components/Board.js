import React, { Component } from 'react';
import classNames from 'classnames';

import Cell from './Cell';
import Icon from './Icon';

import cellState from '../helpers/cellState';

class Board extends Component {

    renderSingleCell(index) {
        let { value, mode, cssClass } = this.props.cells[index];

        const isBomb = value === this.props.bombSign;
        const isVisible = mode === cellState.VISIBLE || (this.props.showAll && mode === cellState.HIDDEN);
        
        let cellClass = classNames(cssClass);

        switch (mode) {
            case cellState.MARKED_AS_BOMB:
                value = <Icon iconClass="icon-flag" />
                break;
            case cellState.MARKED_AS_UNCERTAIN: 
                value = <Icon iconClass="icon-question" />
                break;     
            default:
                if (!isVisible || value === 0) {
                    value = '';
                } else if (isBomb) {
                    value = <Icon iconClass="icon-bomb" />
                }

                cellClass = classNames(cellClass, {
                    'cell-revealed': isVisible,
                    'cell-bomb': isVisible && isBomb,
                    [`cell-${value}`]: isVisible && value > 0 && value <= 8
                });
        }

        return (
            <Cell
                key={index}
                cssClass={cellClass}
                value={value}
                onClick={e => this.props.onClick(index, e)}
                onDblClick={e => this.props.onDblClick(index, e)}
                onContextMenu={e => this.props.onContextMenu(index, e)} />
        )
    }

    render() {
        const rows = this.props.rows; // chujowy performance
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

export default Board;
