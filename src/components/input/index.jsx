
const Input = ({ type, size, label, placeholder, className, ...props }) => {

    return (
        <div className="form-group">
            {label && <label>{label}</label>}
            <input
                type={type}
                placeholder={placeholder}
                className={getInputClassName(size) + ' ' + (className || '')}
                {...props}
            />
        </div>
    );
}

Input.defaultProps = {
    type: "text",
    size: "small",
    placeholder: ''
}

const getInputClassName = (size) => {
    let inputClassName = 'input';

    if (size === 'small') {
        inputClassName += ' input-small';
    }

    return inputClassName;
}

export default Input;