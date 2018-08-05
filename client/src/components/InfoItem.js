import React from 'react';

const InfoItem = props => {

    let label;
    if (props.src) {
        label = (
            <span>
                {/* TODO: temporary className */}
                <img className="icon" {...props} />  
                {/* <Icon src={props.icon} alt={props.alt} /> */}
                <span>{props.label}:</span>
            </span>
        );
    } else {
        label = <span>{props.label}:</span>;
    }

    return (
        <div className="info-item">
            {label}
            <span>{props.value}</span>
        </div>
    )
}

export default InfoItem;