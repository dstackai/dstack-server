import React, {useEffect, useState} from 'react';
import axios from 'axios';
import cx from 'classnames';
import {get, isEqual} from 'lodash-es';
import View from './View';
import config from 'config';
import usePrevious from 'hooks/usePrevious';
import actions from './actions';
import {isImageType} from './utils';
import {useStateValue} from './store';
import css from './styles.module.css';

type Props = {
    id: number,
    frameId: string,
    stack: string,
    className?: string,
    withLoader?: boolean,
}

const Attachment = ({
    id,
    className,
    frameId,
    withLoader,
    stack,
    customData,
}: Props) => {
    const {fetchAttachment} = actions();
    const [{data, apiUrl}] = useStateValue();
    const attachment = get(data, `${frameId}.${id}`, {});
    const {loading, error, requestStatus} = attachment;
    const [loadingFullAttachment, setLoadingFullAttachment] = useState(false);
    const [fullAttachment, setFullAttachment] = useState(null);
    const prevAttachment = usePrevious(attachment);

    const fetchFullAttachment = async () => {
        setLoadingFullAttachment(true);

        try {
            const url = config.STACK_ATTACHMENT(stack, frameId, id) + '?download=true';
            const {data} = await axios({
                baseUrl: apiUrl,
                url,
            });

            setFullAttachment(data.attachment);
        } catch (e) {
            console.log(e);
        }

        setLoadingFullAttachment(false);
    };

    useEffect(() => {
        if (!customData
            && attachment
            && !isEqual(prevAttachment, attachment)
            && attachment.preview
            && isImageType(attachment['content_type'])
        ) {
            fetchFullAttachment()
                .catch(console.log);
        }
    }, [data]);

    useEffect(() => {
        if (!customData
            && (typeof id === 'number' && frameId)
            && ((!attachment.data && !error) || (attachment?.index !== id))
        ) {
            fetchAttachment(stack, frameId, id)
                .catch(console.log);;
        }
    }, [id, frameId]);

    return (
        <div
            className={cx(css.attachment, className, {loading: loading && withLoader || loadingFullAttachment})}
        >
            {customData?.label && <div className={css.label}>{customData?.label}</div>}
            {attachment?.label && <div className={css.label}>{attachment?.label}</div>}

            {!loading && (
                <View
                    requestStatus={requestStatus}
                    fullAttachment={fullAttachment}
                    attachment={customData ? customData : attachment}
                    stack={stack}
                />
            )}
        </div>
    );
};

export default Attachment;
