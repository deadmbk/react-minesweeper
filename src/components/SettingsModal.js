import React, { Component } from 'react';

import {
    Button,
    Form,
    FormGroup,
    FormControl,
    ControlLabel,
    Modal,
    Col
} from 'react-bootstrap';

class SettingsModal extends Component {

    constructor(props) {
        super(props);

        const { rows, cols, bombs } = this.props;

        this.state = {
            cols: cols,
            rows: rows,
            bombs: bombs
        };

        this.close = this.close.bind(this);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    close() {
        this.props.onModalClose();
    }

    handleChange(e) {
        const target = e.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    handleSubmit(e) {
        e.preventDefault();

        this.props.onModalClose(this.state);
    }

    render() {
        return (
            <Modal show={this.props.show} onHide={this.close} bsSize="small">
                <Modal.Header closeButton>
                    <Modal.Title>Edit board options</Modal.Title>
                </Modal.Header>

                <Form horizontal onSubmit={this.handleSubmit}>
                    <Modal.Body>
                        <FormGroup controlId="cols" bsSize="sm">
                            <Col componentClass={ControlLabel} sm={4}>Columns</Col>
                            <Col sm={8}>
                                <FormControl type="number" name="cols" value={this.state.cols} placeholder="Insert number of columns" onChange={this.handleChange} />
                            </Col>
                        </FormGroup>

                        {/* osobny komponent */}
                        <FormGroup controlId="rows" bsSize="sm">
                            <Col componentClass={ControlLabel} sm={4}>Rows</Col>
                            <Col sm={8}>
                                <FormControl type="text" name="rows" value={this.state.rows} placeholder="Insert number of rows" onChange={this.handleChange} />
                            </Col>
                        </FormGroup>

                        <FormGroup controlId="bombs" bsSize="sm">
                            <Col componentClass={ControlLabel} sm={4}>Bombs</Col>
                            <Col sm={8}>
                                <FormControl type="text" name="bombs" value={this.state.bombs} placeholder="Insert number of bombs" onChange={this.handleChange} />
                            </Col>
                        </FormGroup>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button onClick={this.close}>Close</Button>
                        <Button bsStyle="primary" type="submit">Save</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        );
    }
}

export default SettingsModal;
