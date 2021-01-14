import {useAppStore, actionsTypes} from 'AppStore';

export default () => {
    const [, dispatch] = useAppStore();

    const startAppProgress = () => {
        dispatch({type: actionsTypes.START_PROGRESS});
    };

    const setAppProgress = (progress: ?number) => {
        dispatch({
            type: actionsTypes.SET_PROGRESS,
            payload: progress,
        });
    };

    const completeAppProgress = () => {
        dispatch({type: actionsTypes.COMPLETE_PROGRESS});
    };

    const resetAppProgress = () => {
        dispatch({type: actionsTypes.RESET_PROGRESS});
    };

    return {
        startAppProgress,
        setAppProgress,
        completeAppProgress,
        resetAppProgress,
    };
};
