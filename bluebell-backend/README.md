# BlueBell Backend

This is the backend server for BlueBell Totes payment integration using Razorpay.

## Setup

1. Clone the repo
2. Run `npm install`
3. Create `.env` file with Razorpay keys and port
4. Run `npm start`

## API Endpoints

- `POST /api/orders/create-order` - Create Razorpay order
- `POST /api/orders/verify` - Verify Razorpay payment signature

## Notes

- Keep your Razorpay key secret safe.
- Use HTTPS in production.