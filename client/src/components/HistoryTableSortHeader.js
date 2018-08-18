import React, { Component } from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default class HistoryTableSortHeader extends Component {

  addSortHeaderClasses(column) {
    
    /*
      Column can be either "column" or "-column" so indexOf can determine if this column is being sorted and in which order:
      -1 means column is not in a sort prop thus sorting is not done by this column
      0  means column is sorted and order is ascending (substring starts at the beginning meaning no '-' is before it)
      1  means column is sorted and order is descending (substring starts at 1 which means '-' is at 0 position)
    */
    const sortByField = this.props.sort.indexOf(column);


    return classNames({
      'sort-header': true,
      'sort-active': sortByField !== -1,
      'ascending': sortByField === 0
    });
  }

  render() {
    return (
      <th onClick={e => this.props.onSort(this.props.id)} className={this.addSortHeaderClasses(this.props.id)}>
        <FontAwesomeIcon icon="arrow-down" />
        <span>{this.props.label}</span>
      </th>
    )
  }
}
