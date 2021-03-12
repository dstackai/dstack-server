// @flow
import React, {useEffect, useState} from 'react';
import {FileField} from 'components/kit';

import type {TView} from '../types';

interface TUploaderView extends TView {
    uploads: [],
}

type Props = {
    className?: string,
    view: TUploaderView,
    disabled?: boolean,
    onChange?: Function,
}

const UploaderView = ({className, view, disabled, onChange: onChangeProp}: Props) => {
    const [files, setFiles] = useState(view.uploads);

    useEffect(() => setFiles(view.uploads), [view]);

    const onChange = newFiles => {
        setFiles(newFiles);

        if (onChangeProp)
            onChangeProp(
                {
                    ...view,
                    uploads: newFiles,
                },

                {
                    source: view.id,
                    type: newFiles.length > files.length ? 'added' : 'removed',
                }
            );
    };

    return (
        <FileField
            size="small"
            className={className}
            onChange={onChange}
            label={view.label}
            name={view.id}
            multiple={view.multiple}
            files={files}
            disabled={disabled || !view?.enabled}
            appearance={'compact'}
        />
    );
};

export default UploaderView;