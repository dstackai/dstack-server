import React, {useState, useRef, useEffect} from 'react';
import cn from 'classnames';
import usePrevious from 'hooks/usePrevious';
import css from './styles.module.css';

const Progress = ({isActive = true, className, message, progress: propsProgress}) => {
    const [progress, setProgress] = useState(0);
    const step = useRef(0.01);
    const currentProgress = useRef(0);
    const prevIsActive = usePrevious(isActive);
    const requestFrame = useRef(null);
    const isActiveRef = useRef(false);

    useEffect(() => {
        isActiveRef.current = isActive;

        if (isActive && typeof propsProgress !== 'number') {
            setProgress(0);
            step.current = 0.01;
            currentProgress.current = 0;
            startCalculateProgress();
        }

        if (prevIsActive === true && isActive === false) {
            setProgress(100);
            setTimeout(() => setProgress(0), 800);
        }

        if (isActive === null) {
            setProgress(0);
        }

        if (!isActive && requestFrame.current) {
            cancelAnimationFrame(requestFrame.current);
        }
    }, [isActive]);

    useEffect(() => {
        return () => {
            isActiveRef.current = false;
        };
    }, []);

    const calculateProgress = () => {
        currentProgress.current += step.current;
        const progress = Math.round(Math.atan(currentProgress.current) / (Math.PI / 2) * 100 * 1000) / 1000;

        setProgress(progress);

        if (progress > 70)
            step.current = 0.005;

        if (progress >= 100 || !isActiveRef.current)
            cancelAnimationFrame(requestFrame.current);

        if (isActiveRef.current)
            requestFrame.current = requestAnimationFrame(calculateProgress);
    };

    const startCalculateProgress = () => {
        setTimeout(() => {
            if (isActiveRef.current)
                requestAnimationFrame(calculateProgress);
        }, 1000);
    };

    const showProgress = typeof propsProgress === 'number' ? propsProgress : progress;

    return (
        <div className={cn(css.progress, className)}>
            <div className={css.percent}>
                {Math.floor(showProgress)} %
            </div>

            <div className={css.bar}>
                <div style={{width: `${showProgress}%`}} />
            </div>

            <div className={css.label}>{message}</div>
        </div>
    );
};

export default Progress;
