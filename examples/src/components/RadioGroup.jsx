import React from 'react';

export default function RadioGroup({ group, options, input, }) {
    return (
        <div>
            <label htmlFor={input.name}>{input.name}</label>
            {options.map(k => (
                <div key={k}>
                    <label htmlFor={k}>{k}</label>
                    <input id={k} {...input} value={k} checked={input.value === k} name={group} type="radio"/>
                </div>))}
        </div>);
}