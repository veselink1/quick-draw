import React from 'react';
import ReactDOM from 'react-dom';

export default class Modal extends React.Component {
    constructor(props) {
        super(props);
        this.el = document.createElement('div');
    }

    componentDidMount() {
        document.body.appendChild(this.el);
    }

    componentWillUnmount() {
        document.body.removeChild(this.el);
    }

    render() {
        return this.el
            ? ReactDOM.createPortal(this.props.children, this.el)
            : null;
    }
}
