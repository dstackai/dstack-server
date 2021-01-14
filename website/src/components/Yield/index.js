import React from 'react';
import {Portal} from 'react-portal';

const Yield = ({name, className, children}) => {
    if (!name)
        return null;

    if (children) {
        const node = document && document.getElementById(name);

        if (!node)
            return null;

        return (
            <Portal node={node}>
                {children}
            </Portal>
        );
    }

    return (
        <div className={className} id={name} />
    );
};

export default Yield;
