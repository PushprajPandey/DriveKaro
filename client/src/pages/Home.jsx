/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { Button, ButtonGroup, FloatingLabel, Form, Image, Navbar, Container, Card, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { UserPlaceholder } from "../assets";
import { Bookings, NewBooking, UserProfile } from "../components";
import { useApiPrivate, useSessionStorage } from "../hooks";
import "./Home.sass";
import PulseLoader from "react-spinners/PulseLoader";

export default function Home() {
    const [cars, setCars] = useState([]);
    const [user, setUser] = useState({});
    const [searchText, setSearchText] = useState("");
    const [fuelType, setFuelType] = useState("");
    const [seats, setSeats] = useState("");
    const [priceRange, setPriceRange] = useState([1000, 10000]);
    const [selectedCar, setSelectedCar] = useState();
    const [params, setParams] = useState({});
    const [showUserModal, setShowUserModal] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showNewBookingModal, setShowNewBookingModel] = useState(false);
    const [isLoadingCars, setIsLoadingCars] = useState(true);
    const { getItem, removeItem } = useSessionStorage();
    const { getCars, getUserInfo } = useApiPrivate();
    const itemCrRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const authKey = getItem("LOGGED_IN");
        if (!authKey) navigate("/authenticate", { replace: true });
        fetchCars();
        fetchUser();
    }, []);

    useEffect(() => {
        if (Object.keys(params).length > 0) {
            fetchCars();
        }
    }, [params]);

    const fetchUser = async () => {
        const userInfo = await getUserInfo();
        setUser(userInfo);
    };

    const fetchCars = async () => {
        setIsLoadingCars(true);
        const allCars = await getCars(params);
        setCars(allCars && allCars?.length > 0 ? allCars : []);
        setIsLoadingCars(false);
    };

    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        setPriceRange((prevRange) => {
            const newRange = [...prevRange];
            if (name === "minPrice") newRange[0] = Number(value);
            else if (name === "maxPrice") newRange[1] = Number(value);
            return newRange;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const localParams = {};

        if (searchText !== "") localParams.searchText = searchText;
        if (fuelType !== "") localParams.fuel = fuelType;
        if (seats) localParams.numSeats = seats;
        if (priceRange[0] !== 1000 || priceRange[1] !== 100000) {
            localParams.minPrice = priceRange[0];
            localParams.maxPrice = priceRange[1];
        }
        setParams(localParams);
    };

    const handleReset = () => {
        setSearchText("");
        setFuelType("");
        setSeats("");
        setPriceRange([1000, 10000]);
        setParams({});
    };

    const logout = () => {
        removeItem("LOGGED_IN");
        navigate("/authenticate", { replace: true });
    };

    return (
        <>
            <section className="sheet home">
                <Navbar className="nav" expand="lg" variant="light">
                    <Container>
                        <Navbar.Brand href="/">
                            <div className="logo-container">
                                <span className="brand-text">DriveKaro</span>
                            </div>
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                            <ButtonGroup>
                                <Button variant="outline-primary" onClick={() => setShowUserModal(true)} className="user-btn">
                                    <span className="user-avatar">
                                        {user.imgSrc ? <Image roundedCircle src={user.imgSrc} alt={user.name} /> : <UserPlaceholder />}
                                    </span>
                                    {user.name}
                                </Button>
                                <Button variant="outline-primary" onClick={() => setShowBookingModal(true)}>
                                    My Bookings
                                </Button>
                                <Button variant="outline-danger" onClick={logout}>
                                    Logout
                                </Button>
                            </ButtonGroup>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>

                <div className="search-section">
                    <Card className="filter-card">
                        <Card.Header>
                            <h4>Find Your Perfect Ride</h4>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <FloatingLabel controlId="searchText" label="Search" className="mb-3">
                                    <Form.Control
                                        type="text"
                                        placeholder="Search by car name or model"
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                    />
                                </FloatingLabel>

                                <Form.Group className="mb-3">
                                    <Form.Label>Fuel Type</Form.Label>
                                    <div className="d-flex gap-3">
                                        <Form.Check
                                            type="radio"
                                            id="petrol"
                                            label="Petrol"
                                            name="fuelType"
                                            value="petrol"
                                            onChange={(e) => setFuelType(e.target.value)}
                                        />
                                        <Form.Check
                                            type="radio"
                                            id="diesel"
                                            label="Diesel"
                                            name="fuelType"
                                            value="diesel"
                                            onChange={(e) => setFuelType(e.target.value)}
                                        />
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Number of seats</Form.Label>
                                    <Form.Select value={seats} onChange={(e) => setSeats(e.target.value)}>
                                        <option value="">Select seats</option>
                                        {[2, 4, 5, 6, 7, 8].map((seat) => (
                                            <option key={`seats-${seat}`} value={seat}>
                                                {seat}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Price Range (₹ per hour)</Form.Label>
                                    <div className="d-flex gap-2 align-items-center mb-2">
                                        <Form.Control
                                            type="number"
                                            placeholder="Min Value"
                                            value={priceRange[0]}
                                            name="minPrice"
                                            min="1000"
                                            max="100000"
                                            step="1000"
                                            onChange={handlePriceChange}
                                        />
                                        <span>to</span>
                                        <Form.Control
                                            type="number"
                                            placeholder="Max Value"
                                            value={priceRange[1]}
                                            name="maxPrice"
                                            min="1000"
                                            max="100000"
                                            step="1000"
                                            onChange={handlePriceChange}
                                        />
                                    </div>
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button variant="primary" type="submit">
                                        Search
                                    </Button>
                                    <Button variant="outline-secondary" type="reset" onClick={handleReset}>
                                        Reset
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>

                <div className="car-listings" id="itemsCr" ref={itemCrRef}>
                    <h2>Available Vehicles</h2>
                    <div className="car-grid">
                        {isLoadingCars ? (
                            <div className="loader-container">
                                <PulseLoader color="#ff5e3a" />
                            </div>
                        ) : cars.length > 0 ? (
                            cars.map((car, i) => (
                                <Card key={i} className="car-card">
                                    <div className="car-img-container">
                                        <Card.Img variant="top" src={car.imgSrc} alt={car.name} />
                                    </div>
                                    <Card.Body>
                                        <Card.Title>{car.name}</Card.Title>
                                        <div className="car-features">
                                            <Badge bg="info" className="feature-badge">
                                                {car.fuel.replace(/\b\w/g, (char) => char.toUpperCase())}
                                            </Badge>
                                            <Badge bg="info" className="feature-badge">
                                                {car.seats} seats
                                            </Badge>
                                        </div>
                                        <div className="price-section">
                                            <span className="price">₹{car.rent}/hour</span>
                                        </div>
                                        <Button
                                            variant="accent"
                                            className="book-now-btn"
                                            onClick={() => {
                                                setSelectedCar(car);
                                                setShowNewBookingModel(true);
                                            }}
                                        >
                                            Book now
                                        </Button>
                                    </Card.Body>
                                </Card>
                            ))
                        ) : (
                            <div className="no-cars-message">
                                <p>No vehicles found matching your criteria.</p>
                            </div>
                        )}
                    </div>
                </div>

                <footer className="footer">
                    <Container>
                        <p>&copy; 2025 DriveKaro - Premium Car Rental Service</p>
                    </Container>
                </footer>
            </section>

            <UserProfile show={showUserModal} handleClose={() => setShowUserModal(false)} user={user} />
            <Bookings show={showBookingModal} handleClose={() => setShowBookingModal(false)} user={user} fetchUser={fetchUser} />
            <NewBooking show={showNewBookingModal} handleClose={() => setShowNewBookingModel(false)} car={selectedCar} />
        </>
    );
}
