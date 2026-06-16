import { Suspense, useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import "./App.sass";
import CustomRoutes from "./Routes.jsx";
import { useApiPublic, useLoader } from "./hooks";
import { Loader, ServiceUnavailable } from "./pages";
import ErrorBoundary from "./pages/misc/ErrorBoundary.jsx";

export default function App() {
    const { healthCheck } = useApiPublic();
    const { isLoading } = useLoader();
    const [backendUp, setBackendUp] = useState(false);

    useEffect(() => {
        const checkBackendStatus = async () => {
            const isBackendUp = await healthCheck();
            setBackendUp(isBackendUp);
        };
        checkBackendStatus();
    }, [healthCheck]);

    return (
        <ErrorBoundary>
            {backendUp ? (
                <main className="app">
                    <Suspense fallback={<Loader />}>
                        {isLoading && <Loader />}
                        <BrowserRouter>
                            <CustomRoutes />
                        </BrowserRouter>
                    </Suspense>
                </main>
            ) : (
                <ServiceUnavailable />
            )}
        </ErrorBoundary>
    );
}
