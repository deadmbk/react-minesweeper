import React, { Component } from 'react';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

export default class BoardSelect extends Component {

  handleChange(event) {
    const filter = {
      [event.target.name]: event.target.value
    };

    this.props.onValueChange(filter);
  }

  render() {
    return (
      <FormGroup controlId="boardSelect">
          <ControlLabel>Board</ControlLabel>
          <FormControl componentClass="select" name="boardSettings" value={this.props.value} onChange={this.handleChange.bind(this)}>
            <option value="">All configurations</option>
            {
              this.props.list.map(item => {
                return (
                  <option key={item} value={item}>
                    {item === this.props.current ? `${item} (current configuration)` : item}
                  </option>
                )
              })
            }
          </FormControl>
        </FormGroup>
    )
  }
}
