import React, { Component } from 'react';

import HistoryTable from './components/HistoryTable';
import HistoryFilters from './components/HistoryFilters';


/*
Jak zrobić reset przy przejściu na ten tab?
*/
export default class History extends Component {

  defaultSortConfig = { date: 'desc' };

  constructor(props) {
    super(props);

    this.state = {
      history: [],
      filters: {
        status: '',
        boardSettings: '',
        noHintsUsed: false
      },
      sort: this.defaultSortConfig,
    }
  }

  render() {
    return (
      <div>
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
      </div>
    )
  }
}
