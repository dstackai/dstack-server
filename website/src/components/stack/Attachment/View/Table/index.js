
import React from 'react';
import css from './styles.module.css';

type Props = {
    data: Array<Array<string>>,
}

const Table = ({data}: Props) => {
    const [captions, ...rows] = data;

    return (
        <div className={css.table}>
            <table>
                <thead>
                    <tr>
                        {captions.map(caption => (
                            <th key={caption}>{caption}</th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {rows.map((row, index) => (
                        <tr key={index}>
                            {row.map((cell, i) => (
                                <td key={i}>{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
