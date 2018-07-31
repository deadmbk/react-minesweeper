import React from 'react';
import classNames from 'classnames';

// TODO: do icons as background-image
const Icon = props => (
    <span className={classNames('icon', props.iconClass)}></span> 
);

{/* <img className="icon" {...props} /> */}
// const Icon = ({src, alt = ''}) => (
//     <img className="icon" src alt />
// );

Icon.defaultProps = {
    iconClass: ''
}

export default Icon;