import React, { Component } from 'react';
import classNames from 'classnames';


import { Table } from 'react-bootstrap';

import HistoryTableSortHeader from './HistoryTableSortHeader';

class HistoryTable extends Component {

  constructor(props) {
    super(props)

    this.handleSort = this.handleSort.bind(this);
  }

  getFullStatus(status) {
    switch (status) {
      case 'W': return <span className="result-won">Won</span>;
      case 'L': return <span className="result-lost">Lost</span>;
      default: return;
    }
  }

  handleSort(column) {
    this.props.onSort(column);
  }

  addSortHeaderClasses(column) {
    const sort = this.props.sort;
    const sortByField = sort.hasOwnProperty(column);

    return classNames({
      'sort-header': true,
      'sort-active': sortByField,
      'ascending': sortByField && sort[column] === 'asc'
    });
  }

  render() {
    return (
      <Table bordered>
        <thead>
          <tr>
            <HistoryTableSortHeader onSort={this.handleSort} sort={this.props.sort} label="Date" id="date" />
            <th>Board Settings</th>
            <th>Player</th>
            <th>Hints used</th>
            <HistoryTableSortHeader onSort={this.handleSort} sort={this.props.sort} label="Time" id="time" />
            <HistoryTableSortHeader onSort={this.handleSort} sort={this.props.sort} label="Status" id="status" />
          </tr>
        </thead>
        <tbody>
          {
            this.props.history.map(item => {
              return (
                <tr key={item._id} className={item.status === 'W' ? 'table-row-won' : 'table-row-lost'}>
                  <td>{new Date(item.date).toLocaleString()}</td>
                  <td>{item.boardSettings}</td>
                  <td>{item.player}</td>
                  <td>{item.hintsUsed}</td>
                  <td>{item.time}s</td>
                  <td>{this.getFullStatus(item.status)}</td>
                </tr>
              )
            })
          }
        </tbody>
      </Table>
    )
  }
}

export default HistoryTable;
