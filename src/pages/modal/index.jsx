import { useContext, useState } from "react";
import Button from "../../components/button";
import Input from "../../components/input";
import Link from "../../components/link";
import TextArea from "../../components/textArea";
import { AppContext } from "../../store";
import './style.css';

const Modal = () => {

    const [{ privacyPolicyUrl }] = useContext(AppContext);

    const [userInput, setUserInput] = useState({ name: '', email: '', feedback: '' });
    const [sending, setSending] = useState(false);

    const handleSend = () => {
        setSending(true);
        const feedback = window.firebase.firestore().collection('feedback');
        feedback.doc(new Date().getTime() + Math.random().toString().slice(2))
            .set({ ...userInput, date: new Date() })
            .finally(() => window.miro.board.ui.closeModal());
    }

    return (
        <div style={{ margin: 40 }}>
            <h2 className="h2 modal__header">Feedback</h2>
            <p className="p-medium modal__desc">Data used soley for the purpose of improving Miro plugins we make</p>
            <Input
                value={userInput.name}
                placeholder="Name"
                onChange={({ target: { value } }) => { setUserInput({ ...userInput, name: value }) }}
                tabIndex={1}
            />
            <Input
                value={userInput.email}
                placeholder="Email (optional)"
                onChange={({ target: { value } }) => { setUserInput({ ...userInput, email: value }) }}
                tabIndex={2}
            />
            <TextArea
                value={userInput.feedback}
                rows={3}
                placeholder="Add your feedback"
                className="modal__text-area"
                onChange={({ target: { value } }) => { setUserInput({ ...userInput, feedback: value }) }}
                tabIndex={3}
            />
            <Link href={privacyPolicyUrl}
                label="Privacy policy"
                target="blank"
            />
            <Button
                label='Send'
                onClick={handleSend}
                disabled={sending || !userInput.feedback}
                loading={sending}
                className={'modal__button'}
                tabIndex={4}
            />
            <Button
                label='Cancel'
                type='secondary'
                onClick={() => window.miro.board.ui.closeModal()}
                className={'modal__button'}
            />
        </div>
    )
}

export default Modal;