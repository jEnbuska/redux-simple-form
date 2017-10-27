import React from 'react';

export default ({ text, children, ...props }) => (<button {...props}>{text || children}</button>);