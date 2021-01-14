import React, {useEffect, useState} from 'react';
import axios from 'axios';
import cx from 'classnames';
import {get, isEqual} from 'lodash-es';
import View from './View';
import config from 'config';
import useIntersectionObserver from 'hooks/useIntersectionObserver';
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
    isList,
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
            && !isList
            && attachment
            && !isEqual(prevAttachment, attachment)
            && attachment.preview
            && isImageType(attachment['content_type'])
        ) {
            fetchFullAttachment();
        }
    }, [data]);

    useEffect(() => {
        if (!customData
            && !isList
            && (typeof id === 'number' && frameId)
            && ((!attachment.data && !error) || (attachment?.index !== id))
        ) {
            fetchAttachment(stack, frameId, id);
        }
    }, [id, frameId]);

    const [ref] = useIntersectionObserver(() => {
        if (!customData
            && isList
            && !loading
            && (
                (!attachment.data && !error)
                || (attachment.data && attachment.index !== id)
            )
        )
            fetchAttachment(stack, frameId, id);
    }, {}, [id, frameId, data]);

    return (
        <div
            ref={ref}
            className={cx(css.attachment, className, {
                'is-list': isList,
                loading: loading && withLoader || loadingFullAttachment,
            })}
        >
            {!loading && (
                <View
                    requestStatus={requestStatus}
                    className={css.view}
                    isList={isList}
                    fullAttachment={fullAttachment}
                    attachment={customData ? customData : attachment}
                    stack={stack}
                />
            )}
        </div>
    );
};

export default Attachment;
