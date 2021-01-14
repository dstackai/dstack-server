import React, {memo, useRef} from 'react';
import {useDrag, useDrop} from 'react-dnd';

const DnDItem = memo(({id, onMoveItem, children}) => {
    const ref = useRef(null);

    const [, connectDrag] = useDrag({
        item: {id, type: 'IMG'},
        collect: monitor => {
            return {isDragging: monitor.isDragging()};
        },
    });

    const [, connectDrop] = useDrop({
        accept: 'IMG',
        drop: hoveredOverItem => {
            if (hoveredOverItem.id !== id) {
                onMoveItem(hoveredOverItem.id, id);
            }
        },
    });

    connectDrag(ref);
    connectDrop(ref);

    return React.Children.map(children, child =>
        React.cloneElement(child, {forwardedRef: ref})
    );
});

export default DnDItem;
