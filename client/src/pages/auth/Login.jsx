/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Button, FloatingLabel, Form, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { HidePasswordIcon, ShowPasswordIcon } from "../../assets";
import { useApiPublic, useSessionStorage } from "../../hooks";

export default function Login({ setActiveIndex }) {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [submitDisabled, setSubmitDisabled] = useState(true);
    const [formError, setFormError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login, forgotPassword } = useApiPublic();
    const { getItem, setItem } = useSessionStorage();
    const navigate = useNavigate();

    const validateEmail = () => {
        if (email === "") {
            setEmailError("Email is required");
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError("Please enter a valid email address");
            return false;
        }
        setEmailError("");
        return true;
    };

    const validatePassword = () => {
        if (password === "") {
            setPasswordError("Password is required");
            return false;
        }
        setPasswordError("");
        return true;
    };

    const cleanNavigate = (dest) => {
        setEmail("");
        setEmailError("");
        setPassword("");
        setPasswordVisible(false);
        setPasswordError("");
        setFormError("");
        setSubmitDisabled(true);
        setActiveIndex(dest);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();

        if (!isEmailValid || !isPasswordValid) {
            return;
        }

        try {
            setIsLoading(true);
            const res = await login(email, password);

            if (res.next === "login") {
                setFormError(res.message || "Login failed. Please try again.");
            } else if (res.next === "register") {
                cleanNavigate(1);
                return;
            } else if (res.next === "home") {
                setItem("LOGGED_IN", true);
                navigate("/", { replace: true });
                return;
            }
        } catch (error) {
            setFormError("An error occurred. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!validateEmail()) return;

        try {
            setIsLoading(true);
            const res = await forgotPassword(email);
            if (res.next === "register") {
                cleanNavigate(1);
            } else if (res.success) {
                setFormError("");
                alert("Password reset link has been sent to your email address.");
            } else {
                setFormError(res.message || "Failed to send reset link. Please try again.");
            }
        } catch (error) {
            setFormError("An error occurred. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const isEmailValid = email && !emailError;
        const isPasswordValid = password && !passwordError;
        setSubmitDisabled(!(isEmailValid && isPasswordValid) || isLoading);
    }, [email, password, emailError, passwordError, isLoading]);

    useEffect(() => {
        const isLoggedIn = getItem("LOGGED_IN");
        if (isLoggedIn) navigate("/", { replace: true });
    }, []);

    return (
        <div className="auth-card">
            <div className="logo-container">
                <span className="brand-text">DriveKaro</span>
            </div>

            <h3>Login to your account</h3>

            {formError && <Alert variant="danger">{formError}</Alert>}

            <Form className="w-100" onSubmit={handleSubmit}>
                <FloatingLabel controlId="loginEmail" label="Email address">
                    <Form.Control
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={validateEmail}
                        isInvalid={!!emailError}
                        disabled={isLoading}
                        autoComplete="email"
                    />
                    {emailError && <Form.Control.Feedback type="invalid">{emailError}</Form.Control.Feedback>}
                </FloatingLabel>

                <div className="password-field">
                    <FloatingLabel controlId="loginPassword" label="Password">
                        <Form.Control
                            type={passwordVisible ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={validatePassword}
                            isInvalid={!!passwordError}
                            disabled={isLoading}
                            autoComplete="current-password"
                        />
                        {passwordError && <Form.Control.Feedback type="invalid">{passwordError}</Form.Control.Feedback>}
                    </FloatingLabel>

                    <div className="password-toggle" onClick={() => !isLoading && setPasswordVisible((prev) => !prev)}>
                        {passwordVisible ? <HidePasswordIcon /> : <ShowPasswordIcon />}
                    </div>
                </div>

                <div className="d-flex justify-content-end mb-3">
                    <Button variant="link" className="p-0" onClick={handlePasswordReset} disabled={isLoading}>
                        Forgot Password?
                    </Button>
                </div>

                <Button variant="accent" type="submit" disabled={submitDisabled}>
                    {isLoading ? (
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    ) : null}
                    {isLoading ? "Logging in..." : "Login"}
                </Button>
            </Form>

            <div className="form-footer">
                <span>Don't have an account?</span>
                <Button variant="link" onClick={() => !isLoading && cleanNavigate(1)} disabled={isLoading}>
                    Register
                </Button>
            </div>
        </div>
    );
}
