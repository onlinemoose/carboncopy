
const Button = ({ type, size, label, loading, className, ...props }) => {

    return (
        <button
            className={getButtonClassName(type, size, loading) + ' ' + (className || '')}
            {...props}
        >
            {label}
        </button>
    );
}

Button.defaultProps = {
    type: "primary",
    size: "small",
    loading: false
}

const getButtonClassName = (type, size, loading) => {
    let buttonClassName = 'button';
    switch (type) {
        case 'primary': buttonClassName += ' button-primary';
            break;
        case 'secondary': buttonClassName += ' button-secondary';
            break;
        case 'danger': buttonClassName += ' button-danger';
            break;
        case 'secondary-bordered': buttonClassName += ' button-secondary-border';
            break;
        case 'danger-bordered': buttonClassName += ' button-danger-border';
            break;
        default: break;
    }

    if (size === 'small') {
        buttonClassName += ' button-small';
    }

    if (loading) {
        buttonClassName += ' button-loading';
    }

    return buttonClassName;
}

export default Button;