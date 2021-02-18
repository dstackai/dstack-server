// @flow
import React, {useEffect} from 'react';
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
    const [files, setFiles] = useEffect(view.uploads);

    useEffect(() => setFiles(view.data), [view]);

    const onChange = files => {
        setFiles(files);

        if (onChangeProp)
            onChangeProp({
                ...view,
                data: files,
            });
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
            disabled={disabled || view?.enabled}
            appearance={view.colspan > 2 ? 'normal' : 'compact'}
        />
    );
};

export default UploaderView;