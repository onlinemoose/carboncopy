import './style.css';

const CancelButton = ({ className, ...props }) => {

    return (
        <button
            className={'button button-small icon-button' + (className || '')}
            {...props}
        >
            <p className="p-medium icon-button__label">Cancel</p>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px"
                className="icon-button__icon">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M16 8v8H8V8h8m2-2H6v12h12V6z" />
            </svg>
        </button>
    );
}

export default CancelButton;