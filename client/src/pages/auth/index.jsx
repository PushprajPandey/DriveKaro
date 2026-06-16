import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./Auth.sass";
import Login from "./Login";
import Register from "./Register";
import ResetPassword from "./ResetPassword";

export default function Auth() {
    const location = useLocation();
    const [index, setIndex] = useState(0);
    const [email, setEmail] = useState("");
    const { routeIndex, routeEmail } = location.state || {};

    useEffect(() => {
        if (routeIndex) setIndex(routeIndex);
        if (routeEmail) setEmail(routeEmail);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const renderAuthComponent = () => {
        switch (index) {
            case 0:
                return <Login setActiveIndex={setIndex} />;
            case 1:
                return <Register setEmailParent={setEmail} setActiveIndex={setIndex} />;
            case 2:
                return <ResetPassword email={email} setActiveIndex={setIndex} />;
            default:
                return <Login setActiveIndex={setIndex} />;
        }
    };

    return (
        <div className="auth-container">
            <div className="image-section">
                <img
                    src="https://images.unsplash.com/photo-1485291571150-772bcfc10da5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8"
                    alt="Car on road"
                />
                <div className="overlay-text">
                    <h1>Welcome to DriveKaro</h1>
                    <p>Premium car rental services at your fingertips. Discover our fleet and enjoy the journey.</p>
                </div>
            </div>
            <div className="form-section">{renderAuthComponent()}</div>
        </div>
    );
}
