import React, { Component } from 'react';

import {
  Pagination,
  Form,
  FormGroup,
  FormControl,
  ControlLabel
} from 'react-bootstrap';

export default class HistoryTableResultsRow extends Component {
  itemsPerPage = [5, 10, 20, 50];

  changeItemsPerPage(event) {
    this.props.onItemsPerPageChange(event.target.value);
  }

  render() {
    const { total, itemsPerPage, page } = this.props;

    const pagination = [];
    const pages = Math.ceil(total / itemsPerPage);

    for (let i = 1; i <= pages; i++) {
      pagination.push(
        <Pagination.Item
          key={i}
          active={i === page}
          onClick={e => this.props.onPageChange(i)}>
          {i}
        </Pagination.Item>
      );
    }

    return (
      <div className="table-controls">
        <div className="table-results-container">
          <Form inline>
            <FormGroup>
              <FormControl
                componentClass="select"
                value={itemsPerPage}
                onChange={this.changeItemsPerPage.bind(this)}>
                {this.itemsPerPage.map(v => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </FormControl>
              <ControlLabel>Items per page</ControlLabel>
            </FormGroup>
          </Form>

          <div>Result found: {total}</div>
        </div>

        {total !== 0 && <Pagination bsSize="medium">{pagination}</Pagination>}
      </div>
    );
  }
}
