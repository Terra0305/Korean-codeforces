interface LoginButtonProps {
    onClick: () => void;
}

const LoginButton = ({onClick}: LoginButtonProps) => {
    return (
        <button onClick={onClick} className="button">Login</button>
    );
}

export default LoginButton;
