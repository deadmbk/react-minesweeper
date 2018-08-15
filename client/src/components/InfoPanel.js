import React, { Component } from 'react';

import {
    Panel,
    Glyphicon,
    Tooltip,
    OverlayTrigger,
    FormGroup,
    FormControl,
    ControlLabel
} from 'react-bootstrap';

import InfoItem from './InfoItem';
import SettingsModal from './SettingsModal';

import { getPopularBoards } from '../services/gameService';
import { splitSettingsFromString, convertSettingsToString } from '../helpers/utils';

import bombIcon from '../assets/svg/bomb2.svg';
import timeIcon from '../assets/svg/clock.svg';

class InfoPanel extends Component {

    constructor(props) {
        super(props);

        this.state = {
            show: false,
            boards: [],
            selected: ''
        }

        this.showSettingsModal = this.showSettingsModal.bind(this);
    }

    componentDidMount() {
        getPopularBoards()
            .then(result => {

                const boards = result.map(res => {
                    const { boardSettings } = res._id;
                    return {
                        boardConfig: boardSettings,
                        count: res.count
                    }
                });

                this.setState({boards})
            })
            .catch(err => console.log(err));
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

    selectPredefinedConfig(event) {
        const value = event.target.value;

        this.setState({ selected: value });

        const data = splitSettingsFromString(value);
        this.props.onSettingsUpdate(data);
    }

    includes(value) {
        return this.state.boards.some(val => val.boardConfig === value);
    }

    render() {
        const value = convertSettingsToString(this.props);
        const tooltip = <Tooltip placement="bottom" className="in" id="disabled-info-tooltip">You can edit only when game has not been started.</Tooltip>;
        const settingsButton = (
            <button className="edit-settings-button" onClick={this.showSettingsModal} disabled={this.props.inProgress ? 'disabled' : ''}>
                <Glyphicon glyph="cog" />
                <span>Custom..</span>
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
                    <div className="board-settings-wrapper">
                        <FormControl 
                            componentClass="select" 
                            placeholder="select" 
                            value={value} 
                            disabled={this.props.inProgress} 
                            onChange={this.selectPredefinedConfig.bind(this)}>
                            {
                                !this.includes(value) &&
                                <option value=''></option>
                            }
                            {
                                this.state.boards.map(board => (
                                    <option 
                                        key={board.boardConfig} 
                                        value={board.boardConfig}>{board.boardConfig}
                                    </option>
                                ))
                            }
                        </FormControl>
                        {this.props.inProgress ? (
                        <OverlayTrigger placement="bottom" overlay={tooltip}>{settingsButton}</OverlayTrigger>
                    ) : settingsButton}
                    </div>
                    {/* <FormGroup controlId="formControlsSelect"> */}
                        {/* <ControlLabel>Choose predefined config</ControlLabel> */}
                        
                    {/* </FormGroup> */}

                    

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