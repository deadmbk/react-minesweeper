import React, { Component } from 'react';
import { Form, Checkbox, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';

import BoardSelect from './BoardSelect';

class HistoryFilters extends Component {

  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleToggleButtonChange = this.handleToggleButtonChange.bind(this);
  }

  handleChange(event) {
    const filter = {
      [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
    };

    this.props.onFilterChange(filter);
  }

  handleToggleButtonChange(event) {
    this.props.onFilterChange({ status: event });
  }

  render() {
    return (
      <Form>
        <ToggleButtonGroup type="radio" name="status" value={this.props.filters.status} onChange={this.handleToggleButtonChange}>
          <ToggleButton value="">All games</ToggleButton>
          <ToggleButton value="w">Won</ToggleButton>
          <ToggleButton value="l">Lost</ToggleButton>
        </ToggleButtonGroup>

        <BoardSelect
          value={this.props.filters.boardSettings}
          onValueChange={v => this.props.onFilterChange(v)} />

        <Checkbox name="noHintsUsed" checked={this.props.filters.noHintsUsed} onChange={this.handleChange}>No hints used</Checkbox>
      </Form>
    );
  }
}

export default HistoryFilters;
