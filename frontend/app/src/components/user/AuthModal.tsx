import Login from "./Login";
import Signup from "./Signup";
import { useState } from "react";

interface AuthModalProps {
    onClose: () => void;
}

type AuthModalType = 'login' | 'signup';

const AuthModal = ({onClose}: AuthModalProps) => {
    const [type, setType] = useState<AuthModalType>('login');
    return (
        <div>
            {type === 'login' ? <Login onClose={onClose} /> : <Signup onClose={onClose} />}
        </div>
    );
}

export default AuthModal;
