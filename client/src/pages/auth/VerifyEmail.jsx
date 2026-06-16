import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApiPublic } from "../../hooks";
import { Container, Spinner, Alert, Card } from "react-bootstrap";
import "./Auth.sass";

export default function VerifyEmail() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { verifyEmail } = useApiPublic();
    const [verifying, setVerifying] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState(false);

    useEffect(() => {
        const verify = async () => {
            try {
                if (!token) {
                    setError(true);
                    setMessage("Invalid verification link.");
                    setVerifying(false);
                    setTimeout(() => navigate("/authenticate", { replace: true }), 3000);
                    return;
                }

                const res = await verifyEmail(token);
                setMessage(res.message || "");
                setVerifying(false);

                if (res?.next === "login") {
                    setTimeout(() => navigate("/authenticate", { replace: true }), 3000);
                } else if (res?.next === "update_password") {
                    setTimeout(
                        () =>
                            navigate("/authenticate", {
                                replace: true,
                                state: { routeIndex: 2, routeEmail: res.email },
                            }),
                        3000,
                    );
                } else {
                    setError(true);
                    setTimeout(() => navigate("/authenticate", { replace: true }), 3000);
                }
            } catch (error) {
                setError(true);
                setMessage("An error occurred during verification. Please try again.");
                setVerifying(false);
                setTimeout(() => navigate("/authenticate", { replace: true }), 3000);
            }
        };

        verify();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="auth-container">
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
                <Card className="auth-card text-center p-5">
                    <div className="logo-container justify-content-center mb-4">
                        <span className="brand-text">DriveKaro</span>
                    </div>

                    <h3 className="text-center mb-4">Email Verification</h3>

                    {verifying ? (
                        <div className="text-center">
                            <Spinner animation="border" variant="primary" className="mb-3" />
                            <p>Verifying your email address...</p>
                        </div>
                    ) : (
                        <Alert variant={error ? "danger" : "success"}>
                            {message}
                            <p className="mt-2 small">You will be redirected to the login page in a few seconds...</p>
                        </Alert>
                    )}
                </Card>
            </Container>
        </div>
    );
}
