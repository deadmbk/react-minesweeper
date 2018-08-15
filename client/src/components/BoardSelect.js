import React, { Component } from 'react';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

import { connect } from 'react-redux';

class BoardSelect extends Component {

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
              this.props.boardConfig.boardConfigs.map(item => {
                return (
                  <option key={item} value={item}>
                    {item === this.props.boardConfig.currentBoardConfig ? `${item} (current configuration)` : item}
                  </option>
                )
              })
            }
          </FormControl>
        </FormGroup>
    )
  }
}

const mapStateToProps = state => ({
  boardConfig: state.boardConfig
})

export default connect(mapStateToProps)(BoardSelect);
