
const TextArea = ({ type, size, label, placeholder, rows, disableSpellCheck, className, ...props }) => {

    return (
        <div className="form-group">
            {label && <label>{label}</label>}
            <textarea
                type={type}
                placeholder={placeholder}
                rows={rows}
                spellCheck={!disableSpellCheck}
                className={'textarea ' + (className || '')}
                {...props}
            />
        </div>
    );
}

TextArea.defaultProps = {
    type: "text",
    size: "small",
    placeholder: '',
    rows: 1
}

export default TextArea;