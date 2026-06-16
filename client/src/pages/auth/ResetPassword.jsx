import { useEffect, useState } from "react";
import { Button, Alert, FloatingLabel, Form } from "react-bootstrap";
import { HidePasswordIcon, ShowPasswordIcon } from "../../assets";
import { useApiPublic } from "../../hooks";

export default function ResetPassword({ email, setActiveIndex }) {
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [submitDisabled, setSubmitDisabled] = useState(true);
    const [formError, setFormError] = useState("");
    const { resetPassword } = useApiPublic();

    const validatePassword = () => {
        if (password === "") {
            setPasswordError("Password is required");
            return false;
        }
        if (password.length < 8) {
            setPasswordError("Password must be at least 8 characters long");
            return false;
        }
        if (password.length > 20) {
            setPasswordError("Password must be less than 20 characters");
            return false;
        }
        setPasswordError("");
        return true;
    };

    const validateConfirmPassword = () => {
        if (confirmPassword === "") {
            setConfirmPasswordError("Confirm password is required");
            return false;
        }
        if (confirmPassword !== password) {
            setConfirmPasswordError("Passwords do not match");
            return false;
        }
        setConfirmPasswordError("");
        return true;
    };

    const cleanNavigate = (dest) => {
        setPassword("");
        setPasswordVisible(false);
        setPasswordError("");
        setConfirmPassword("");
        setConfirmPasswordVisible(false);
        setConfirmPasswordError("");
        setFormError("");
        setSubmitDisabled(true);
        setActiveIndex(dest);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isPasswordValid = validatePassword();
        const isConfirmValid = validateConfirmPassword();

        if (!isPasswordValid || !isConfirmValid) {
            return;
        }

        try {
            const res = await resetPassword(email, password);

            if (res.success) {
                setFormError("");
                alert("Password reset successful! You can now login with your new password.");
                cleanNavigate(0);
            } else {
                setFormError(res.message || "Password reset failed. Please try again.");
            }
        } catch (error) {
            setFormError("An error occurred. Please try again later.");
        }
    };

    useEffect(() => {
        const isPasswordValid = password && !passwordError;
        const isConfirmValid = confirmPassword && !confirmPasswordError;
        setSubmitDisabled(!(isPasswordValid && isConfirmValid));
    }, [password, confirmPassword, passwordError, confirmPasswordError]);

    return (
        <div className="auth-card">
            <div className="logo-container">
                <span className="brand-text">DriveKaro</span>
            </div>

            <h3>Reset Password</h3>

            {formError && <Alert variant="danger">{formError}</Alert>}

            <Form className="w-100" onSubmit={handleSubmit}>
                <div className="password-field">
                    <FloatingLabel controlId="resPassword" label="New Password">
                        <Form.Control
                            type={passwordVisible ? "text" : "password"}
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={validatePassword}
                            isInvalid={!!passwordError}
                        />
                        {passwordError && <Form.Control.Feedback type="invalid">{passwordError}</Form.Control.Feedback>}
                    </FloatingLabel>

                    <div className="password-toggle" onClick={() => setPasswordVisible((prev) => !prev)}>
                        {passwordVisible ? <HidePasswordIcon /> : <ShowPasswordIcon />}
                    </div>
                </div>

                <div className="password-field">
                    <FloatingLabel controlId="resConfirmPassword" label="Confirm Password">
                        <Form.Control
                            type={confirmPasswordVisible ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onBlur={validateConfirmPassword}
                            isInvalid={!!confirmPasswordError}
                        />
                        {confirmPasswordError && <Form.Control.Feedback type="invalid">{confirmPasswordError}</Form.Control.Feedback>}
                    </FloatingLabel>

                    <div className="password-toggle" onClick={() => setConfirmPasswordVisible((prev) => !prev)}>
                        {confirmPasswordVisible ? <HidePasswordIcon /> : <ShowPasswordIcon />}
                    </div>
                </div>

                <Button variant="accent" type="submit" disabled={submitDisabled}>
                    Reset Password
                </Button>
            </Form>

            <div className="form-footer">
                <Button variant="link" onClick={() => cleanNavigate(0)}>
                    Back to Login
                </Button>
            </div>
        </div>
    );
}
