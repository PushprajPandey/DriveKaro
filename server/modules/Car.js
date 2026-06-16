import dayjs from "dayjs";
import Stripe from "stripe";
import { ENV } from "../config/index.js";
import { BookingModel, CarModel, UserModel } from "../models/index.js";

const getAllCars = async (req, res, next) => {
    console.log("Get all cars requested!");
    try {
        let { searchText, fuel, numSeats, minPrice, maxPrice } = req.query;
        const matchConditions = {};

        if (searchText) matchConditions.name = { $regex: searchText, $options: "i" };
        if (fuel) matchConditions.fuel = fuel;
        if (numSeats) matchConditions.seats = parseInt(numSeats);
        if (minPrice || maxPrice) {
            matchConditions.rent = {};
            if (minPrice) matchConditions.rent.$gte = parseInt(minPrice);
            if (maxPrice) matchConditions.rent.$lte = parseInt(maxPrice);
        }
        const cars = await CarModel.aggregate([
            { $match: matchConditions },
            {
                $lookup: {
                    from: "bookings",
                    localField: "_id",
                    foreignField: "carId",
                    as: "bookingDetails",
                },
            },
            {
                $project: {
                    id: { $toString: "$_id" },
                    name: 1,
                    imgSrc: "$image",
                    seats: 1,
                    rent: 1,
                    fuel: 1,
                    bookingDetails: {
                        $map: {
                            input: "$bookingDetails",
                            as: "booking",
                            in: {
                                from: "$$booking.from",
                                to: "$$booking.to",
                            },
                        },
                    },
                    _id: 0,
                },
            },
            { $limit: 20 },
        ]);
        res.status(200).send({ data: cars });
    } catch (err) {
        console.error(err);
        next(err);
    }
};

const newBooking = async (req, res) => {
    console.log("New Booking", req.body);
    try {
        const { carId, bookingStartTime, bookingEndTime, bookingHours, id } = req.body;
        const [carDetails, userDetails] = await Promise.all([
            CarModel.findById(carId, { name: 1, rent: 1 }),
            UserModel.findById(id, { email: 1 }),
        ]);
        const startTime = dayjs(bookingStartTime);
        const endTime = dayjs(bookingEndTime);

        const stripe = new Stripe(ENV.STRIPE_KEY);
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: carDetails.name,
                            description: `Booking from ${bookingStartTime} to ${bookingEndTime}`,
                        },
                        unit_amount: carDetails.rent * 100,
                    },
                    quantity: bookingHours,
                },
            ],
            customer_email: userDetails.email,
            mode: "payment",
            success_url: `${ENV.CLIENT_URL}${ENV.PAYMENT_CONF_URL}?success=true`,
            cancel_url: `${ENV.CLIENT_URL}${ENV.PAYMENT_CONF_URL}?success=false`,
        });
        await BookingModel.create({ carId, userId: id, from: startTime, to: endTime, paymentId: session.id });
        res.cookie("SID", session.id, { origin: ENV.CLIENT_URL, sameSite: "none", httpOnly: true, secure: true, maxAge: 15 * 60 * 1000 });
        res.status(200).send({ url: session.url, next: "redirect" });
    } catch (err) {
        console.error(err);
        res.status(200).send({ message: "Unable to book at the moment!", next: "" });
    }
};

const retryBooking = async (req, res, next) => {
    console.log("Retry Booking");
    try {
        const { id } = req.params;
        const bookingDetails = await BookingModel.findById(id);
        if (!bookingDetails) return res.status(200).send({ message: "Invalid booking", next: "home" });
        const startTime = dayjs(bookingDetails.from);
        const endTime = dayjs(bookingDetails.to);
        const bookingHours = endTime.diff(startTime, "hours");
        const [carDetails, userDetails] = await Promise.all([
            CarModel.findById(bookingDetails.carId, { name: 1, rent: 1 }),
            UserModel.findById(bookingDetails.userId, { email: 1 }),
        ]);

        const stripe = new Stripe(ENV.STRIPE_KEY);
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: carDetails.name,
                            description: `Booking from ${startTime} to ${endTime}`,
                        },
                        unit_amount: carDetails.rent * 100,
                    },
                    quantity: bookingHours,
                },
            ],
            customer_email: userDetails.email,
            mode: "payment",
            success_url: `${ENV.CLIENT_URL}${ENV.PAYMENT_CONF_URL}?success=true`,
            cancel_url: `${ENV.CLIENT_URL}${ENV.PAYMENT_CONF_URL}?success=false`,
        });
        await BookingModel.findByIdAndUpdate(id, { paymentId: session.id, status: "pending" });
        res.cookie("SID", session.id, { origin: ENV.CLIENT_URL, sameSite: "none", httpOnly: true, secure: true, maxAge: 15 * 60 * 1000 });
        res.status(200).send({ url: session.url, next: "redirect" });
    } catch (err) {
        console.error(err);
        next(err);
    }
};

const confirmBooking = async (req, res) => {
    console.log("Confirming booking");
    const { success, id } = req.body;
    const sessionId = req.cookies.SID;
    if (!sessionId) return res.status(200).send({ message: "Invalid booking", next: "home" });
    const bookingDetails = await BookingModel.findOne({ userId: id, paymentId: sessionId });
    if (!bookingDetails) return res.status(200).send({ message: "Invalid booking", next: "home" });
    const stripe = new Stripe(ENV.STRIPE_KEY);
    const session = await stripe.checkout.sessions.retrieve(req.cookies.SID);
    const { payment_status, status } = session;
    console.log(payment_status, status);
    let bookingStatus = success === "true" && payment_status === "paid" && status === "complete" ? "completed" : "failed";
    await BookingModel.findByIdAndUpdate(bookingDetails._id, { $set: { status: bookingStatus } });
    console.log("S", payment_status, status);
    res.status(200).send({ message: "Booking successful!", next: "home" });
};

const cancelBooking = async (req, res) => {
    console.log("Cancel booking");
    const { id } = req.params;
    const bookingDetails = await BookingModel.findById(id);
    if (!bookingDetails) return res.status(200).send({ message: "Invalid booking", next: "home" });
    const currentTime = dayjs();
    const bookingStartTime = dayjs(bookingDetails.from);
    if (bookingStartTime.isBefore(currentTime)) return res.status(200).send({ message: "Can't cancel this booking", next: "home" });
    await BookingModel.findByIdAndUpdate(id, { status: "canceled" });
    res.status(200).send({ message: "Booking canceled successfully!", next: "home" });
};

export default { getAllCars, newBooking, retryBooking, confirmBooking, cancelBooking };
