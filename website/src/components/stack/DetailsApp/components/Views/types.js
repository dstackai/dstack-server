// @flow

export interface TView {
    container: 'sidebar' | 'main',
    type: string | 'OutputView',
    enabled?: boolean,
    rowspan?: number,
    colspan?: number,
    [key: string]: any,
}