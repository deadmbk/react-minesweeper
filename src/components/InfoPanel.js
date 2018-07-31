import React, { Component } from 'react';

import {
    Panel,
    Glyphicon,
    Tooltip,
    OverlayTrigger
} from 'react-bootstrap';

import InfoItem from './InfoItem';
import SettingsModal from './SettingsModal';

import bombIcon from '../assets/svg/bomb2.svg';
import timeIcon from '../assets/svg/clock.svg';

class InfoPanel extends Component {

    constructor(props) {
        super(props);

        this.state = {
            show: false
        }

        this.showSettingsModal = this.showSettingsModal.bind(this);
    }

    showSettingsModal(e) {
        e.preventDefault();

        this.setState({
            show: true
        });
    }

    closeSettingsModal(data) {
        if (data !== undefined) {
            this.props.onSettingsUpdate(data);
        }

        this.setState({
            show: false
        });
    }

    render() {

        const tooltip = <Tooltip placement="bottom" className="in" id="disabled-info-tooltip">You can edit only when game has not been started.</Tooltip>;
        const settingsButton = (
            <button className="edit-settings-button" onClick={this.showSettingsModal} disabled={this.props.inProgress ? 'disabled' : ''}>
                <Glyphicon glyph="cog" />
                <span>Edit settings</span>
            </button>
        );

        return (
            <Panel className="info-panel" bsStyle="info">
                <Panel.Heading>
                    <Panel.Title componentClass="h2">Info</Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    <InfoItem label="Dimensions" value={this.props.cols + 'x' + this.props.rows} />
                    <InfoItem label="Bombs" value={this.props.bombs} />

                    {this.props.inProgress ? (
                        <OverlayTrigger placement="bottom" overlay={tooltip}>{settingsButton}</OverlayTrigger>
                    ) : settingsButton}

                    <InfoItem label="Time" value={this.props.timeElapsed + 's'} src={timeIcon} alt="Time elapsed" />
                    <InfoItem label="Bombs left" value={this.props.bombsLeft} src={bombIcon} alt="Bombs left" />

                    <SettingsModal 
                        show={this.state.show}
                        rows={this.props.rows}
                        cols={this.props.cols}
                        bombs={this.props.bombs}
                        onModalClose={(data) => this.closeSettingsModal(data)} />
                </Panel.Body>
            </Panel>
        )
    }
}

export default InfoPanel;