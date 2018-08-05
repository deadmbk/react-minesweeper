import React, { Component } from 'react';
import {
    Button,
    Panel
} from 'react-bootstrap';

class ControlPanel extends Component {
    render() {

        const pauseButton = this.props.inProgress && <Button onClick={e => this.props.onTogglePause()}>{this.props.paused ? 'Resume game' : 'Pause game'}</Button>;
        const revealButon = this.props.inProgress && <Button onClick={e => this.props.onToggleReveal()}>{this.props.revealed ? 'Hide cells' : 'Show cells'}</Button>;

        return (
            <Panel className="control-panel">
                <Panel.Heading>
                    <Panel.Title componentClass="h2">Controls</Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    <Button bsStyle="primary" onClick={e => this.props.onStartNewGame()}>New Game</Button>
                    {pauseButton}
                    {revealButon}
                </Panel.Body>
            </Panel>
        )
    }
}

export default ControlPanel;
