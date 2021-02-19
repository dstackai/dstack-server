// @flow

export interface TView {
    id: string,
    container: 'sidebar' | 'main',
    type: string | 'OutputView',
    enabled?: boolean,
    rowspan?: number,
    colspan?: number,
    [key: string]: any,
}