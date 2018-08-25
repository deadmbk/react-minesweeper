import React, { Component } from 'react';
import {
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  Checkbox,
  ToggleButtonGroup,
  ToggleButton
} from 'react-bootstrap';

import BoardSelect from './BoardSelect';

class HistoryFilters extends Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleToggleButtonChange = this.handleToggleButtonChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
  }

  handleChange(event) {
    const filter = {
      [event.target.name]:
        event.target.type === 'checkbox'
          ? event.target.checked
          : event.target.value
    };

    this.props.onFilterChange(filter);
  }

  handleToggleButtonChange(event) {
    this.props.onFilterChange({ status: event });
  }

  handleDateChange(event) {
    const value = event.target.value;
    const d = new Date();

    let from = '';
    let to = '';

    switch (value) {
      case 'last-day':
        from = d.setDate(d.getDate() - 1);
        break;
      case 'last-week':
        from = d.setDate(d.getDate() - 7);
        break;
      case 'last-month':
        from = d.setMonth(d.getMonth() - 1);
        break;
      default:
    }

    const filter = {
      [event.target.name]: {
        from,
        to,
        value
      }
    };

    this.props.onFilterChange(filter);
  }

  render() {
    return (
      <Form>
        <ToggleButtonGroup
          type="radio"
          name="status"
          value={this.props.filters.status}
          onChange={this.handleToggleButtonChange}>
          <ToggleButton value="">All games</ToggleButton>
          <ToggleButton value="w">Won</ToggleButton>
          <ToggleButton value="l">Lost</ToggleButton>
        </ToggleButtonGroup>

        <BoardSelect
          value={this.props.filters.boardSettings}
          onValueChange={v => this.props.onFilterChange(v)}
        />

        <FormGroup>
          <ControlLabel>Date</ControlLabel>
          <FormControl
            componentClass="select"
            name="date"
            value={this.props.filters.date.value}
            onChange={this.handleDateChange}>
            <option value="">Any time</option>
            <option value="last-day">Last day</option>
            <option value="last-week">Last week</option>
            <option value="last-month">Last month</option>
          </FormControl>
        </FormGroup>

        <Checkbox
          name="noHintsUsed"
          checked={this.props.filters.noHintsUsed}
          onChange={this.handleChange}>
          No hints used
        </Checkbox>
      </Form>
    );
  }
}

export default HistoryFilters;
