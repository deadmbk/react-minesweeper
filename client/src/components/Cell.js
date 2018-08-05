import React from 'react';

const Cell = props => {

    let classname = 'cell';
    if (props.cssClass) {
        classname += ' ' + props.cssClass;
    }

    return (
        <button className={classname}
            onContextMenu={e => props.onContextMenu(e)}
            onDoubleClick={e => props.onDblClick(e)}
            onClick={e => props.onClick(e)}>
            {props.value}
        </button>
    );
}

export default Cell;