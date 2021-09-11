import './style.css';

const Checkbox = ({ label, checked, disabled, indeterminate, className, ...props }) => {

    return (
        <label className={'checkbox ' + (disabled ? 'checkbox__disabled' : '') + (className || '')} {...props}>
            <input type="checkbox" checked={checked} style={{ visibility: "hidden" }} />
            <span className={indeterminate ? 'checkbox__span' : ''}>{label}</span>
        </label>
    );
}

export default Checkbox;