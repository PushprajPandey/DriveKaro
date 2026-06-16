/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Alert, Button, FloatingLabel, Form, Spinner } from "react-bootstrap";
import { HidePasswordIcon, ShowPasswordIcon } from "../../assets";
import { useApiPublic, useSessionStorage } from "../../hooks";
import { useNavigate } from "react-router-dom";

export default function Register({ setActiveIndex }) {
    const [name, setName] = useState("");
    const [nameError, setNameError] = useState("");
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [phone, setPhone] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [address, setAddress] = useState("");
    const [addressError, setAddressError] = useState("");
    const [submitDisabled, setSubmitDisabled] = useState(true);
    const [formError, setFormError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useApiPublic();
    const { setItem } = useSessionStorage();
    const navigate = useNavigate();

    const validateName = () => {
        if (name === "") {
            setNameError("Name is required");
            return false;
        }
        if (name.length < 3) {
            setNameError("Name must be at least 3 characters");
            return false;
        }
        setNameError("");
        return true;
    };

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
        if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            return false;
        }
        setPasswordError("");
        return true;
    };

    const validatePhone = () => {
        if (phone === "") {
            setPhoneError("Phone number is required");
            return false;
        }
        if (!/^[0-9]{10}$/.test(phone)) {
            setPhoneError("Please enter a valid 10-digit phone number");
            return false;
        }
        setPhoneError("");
        return true;
    };

    const validateAddress = () => {
        if (address === "") {
            setAddressError("Address is required");
            return false;
        }
        if (address.length < 10) {
            setAddressError("Please enter your complete address");
            return false;
        }
        setAddressError("");
        return true;
    };

    const cleanNavigate = (dest) => {
        setName("");
        setNameError("");
        setEmail("");
        setEmailError("");
        setPassword("");
        setPasswordError("");
        setPhone("");
        setPhoneError("");
        setAddress("");
        setAddressError("");
        setFormError("");
        setPasswordVisible(false);
        setSubmitDisabled(true);
        setActiveIndex(dest);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        const isPhoneValid = validatePhone();
        const isAddressValid = validateAddress();

        if (!isNameValid || !isEmailValid || !isPasswordValid || !isPhoneValid || !isAddressValid) {
            return;
        }

        try {
            setIsLoading(true);
            const res = await register(name, email, password, phone, address);

            if (res.next === "register") {
                setFormError(res.message || "Registration failed. Please try again.");
            } else if (res.next === "login") {
                cleanNavigate(0);
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

    useEffect(() => {
        const isNameValid = name && !nameError;
        const isEmailValid = email && !emailError;
        const isPasswordValid = password && !passwordError;
        const isPhoneValid = phone && !phoneError;
        const isAddressValid = address && !addressError;
        setSubmitDisabled(!(isNameValid && isEmailValid && isPasswordValid && isPhoneValid && isAddressValid) || isLoading);
    }, [name, email, password, phone, address, nameError, emailError, passwordError, phoneError, addressError, isLoading]);

    return (
        <div className="auth-card">
            <div className="logo-container">
                <span className="brand-text">DriveKaro</span>
            </div>

            <h3>Create your account</h3>

            {formError && <Alert variant="danger">{formError}</Alert>}

            <Form className="w-100" onSubmit={handleSubmit}>
                <FloatingLabel controlId="registerName" label="Full Name">
                    <Form.Control
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={validateName}
                        isInvalid={!!nameError}
                        disabled={isLoading}
                        autoComplete="name"
                    />
                    {nameError && <Form.Control.Feedback type="invalid">{nameError}</Form.Control.Feedback>}
                </FloatingLabel>

                <FloatingLabel controlId="registerEmail" label="Email address">
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
                    <FloatingLabel controlId="registerPassword" label="Password">
                        <Form.Control
                            type={passwordVisible ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={validatePassword}
                            isInvalid={!!passwordError}
                            disabled={isLoading}
                            autoComplete="new-password"
                        />
                        {passwordError && <Form.Control.Feedback type="invalid">{passwordError}</Form.Control.Feedback>}
                    </FloatingLabel>

                    <div className="password-toggle" onClick={() => !isLoading && setPasswordVisible((prev) => !prev)}>
                        {passwordVisible ? <HidePasswordIcon /> : <ShowPasswordIcon />}
                    </div>
                </div>

                <FloatingLabel controlId="registerPhone" label="Phone Number">
                    <Form.Control
                        type="tel"
                        placeholder="1234567890"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        onBlur={validatePhone}
                        isInvalid={!!phoneError}
                        disabled={isLoading}
                        autoComplete="tel"
                    />
                    {phoneError && <Form.Control.Feedback type="invalid">{phoneError}</Form.Control.Feedback>}
                </FloatingLabel>

                <FloatingLabel controlId="registerAddress" label="Address">
                    <Form.Control
                        as="textarea"
                        placeholder="Enter your full address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        onBlur={validateAddress}
                        isInvalid={!!addressError}
                        style={{ height: "100px" }}
                        disabled={isLoading}
                        autoComplete="street-address"
                    />
                    {addressError && <Form.Control.Feedback type="invalid">{addressError}</Form.Control.Feedback>}
                </FloatingLabel>

                <Button variant="accent" type="submit" className="mt-3" disabled={submitDisabled}>
                    {isLoading ? (
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    ) : null}
                    {isLoading ? "Creating Account..." : "Register"}
                </Button>
            </Form>

            <div className="form-footer">
                <span>Already have an account?</span>
                <Button variant="link" onClick={() => !isLoading && cleanNavigate(0)} disabled={isLoading}>
                    Login
                </Button>
            </div>
        </div>
    );
}
