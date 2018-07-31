import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';

import { Slider } from 'react-slider';
import InfoItem from './InfoItem';

class VisualPanel extends Component {

    constructor(props) {
        super(props);

        this.boardEl = null;

        this.state = {
            zoom: ''
        };

        this.zoomChanged = this.zoomChanged.bind(this);
    }

    componentDidMount() {
        this.boardEl = document.querySelector('.board');

        if (this.boardEl) {
            const board = this.boardEl;
            const fs = parseFloat(window.getComputedStyle(board).fontSize);
            const zoom = fs / 10;

            this.setState({
                zoom: zoom
            });
        }
    }

    zoomChanged(value) {
        const zoom = Number(Number(value).toFixed(2));

        this.setState({
            zoom: zoom
        });

        this.boardEl.style.setProperty('--board-font-size', zoom * 10 + 'px');
    }

    render() {

        return (
            <Panel className="visual-panel">
                <Panel.Heading>
                    <Panel.Title componentClass="h2">Visuals</Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    <InfoItem label="Zoom" value={this.state.zoom} />
                    {this.state.zoom &&
                        <Slider min="0.6" max="1.3" step="0.1" value={this.state.zoom} onValueChange={this.zoomChanged} color="#89c4fa" />
                    }
                </Panel.Body>
            </Panel>
        )
    }
}

export default VisualPanel;
