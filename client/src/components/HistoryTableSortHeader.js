import React, { Component } from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default class HistoryTableSortHeader extends Component {

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
      <th onClick={e => this.props.onSort(this.props.id)} className={this.addSortHeaderClasses(this.props.id)}>
        <FontAwesomeIcon icon="arrow-down" />
        <span>{this.props.label}</span>
      </th>
    )
  }
}
