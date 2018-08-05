import React, { Component } from 'react';
import { Form, FormGroup, ControlLabel, FormControl, Checkbox } from 'react-bootstrap';

import BoardSelect from './BoardSelect';

class HistoryFilters extends Component {

  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const filter = {
      [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
    };

    this.props.onFilterChange(filter);
  }

  render() {
    return (
      <Form>
        <FormGroup controlId="statusSelect">
          <ControlLabel>Status</ControlLabel>
          <FormControl componentClass="select" name="status" value={this.props.filters.status} onChange={this.handleChange}>
            <option value="">All games</option>
            <option value="w">Won</option>
            <option value="l">Lost</option>
          </FormControl>
        </FormGroup>

        <BoardSelect 
          value={this.props.filters.boardSettings} 
          current={this.props.currentBoardSettings} 
          list={this.props.boardSettingsList} 
          onValueChange={v => this.props.onFilterChange(v)} />

        <Checkbox name="noHintsUsed" checked={this.props.filters.noHintsUsed} onChange={this.handleChange}>No hints used</Checkbox>
      </Form>
    );
  }
}

export default HistoryFilters;
