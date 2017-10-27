import React from 'react';

export default function Select({ input, options, visited, onErrorMessage, invalid}) {
    return (
        <div>
            <select {...input}>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <p className={`input-warn${visited && invalid ? '-shown' : ''}`}>{onErrorMessage}</p>
        </div>);
}