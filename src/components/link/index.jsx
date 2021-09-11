
const Link = ({ type, label, className, ...props }) => {

    return (
        <a
            className={getLinkClassName(type) + ' ' + (className || '')}
            {...props}
        >
            {label}
        </a>
    );
}

Link.defaultProps = {
    type: "primary"
}

const getLinkClassName = (type) => {
    let className = 'link';

    switch (type) {
        case 'primary': className += ' link-primary';
            break;
        case 'danger': className += ' link-danger';
            break;
        case 'text': className += ' link-text';
            break;
        default: break;
    }

    return className;
}

export default Link;