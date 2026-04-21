# **App Name**: ZYRO

## Core Features:

- Location Input and Storage: Capture pickup and drop locations from the user and store them in Firestore under the `bookings` collection, including timestamp and status ('pending').
- Fare Estimation and Car Display: Retrieve car details (carType, baseFare, perKmRate) from the `cars` collection in Firestore, calculate estimated fares, and display the top 4 car options with price breakdowns to the user.
- Customer Data Collection: Collect user's name, mobile number, and email after car selection and store it in a `customer` sub-collection within the `bookings` document.
- Driver Assignment Orchestration: AI tool to pick one nearest available driver for user by considering real-time availability and location. The assignment uses data from the `drivers` collection and updates the booking with the assigned `driverId`. Considerations must be given when selecting to prioritize fair workload distributions.
- Driver Notification: Notify the assigned driver via Firebase Cloud Messaging (FCM) with customer details and destination upon booking confirmation, including automatic updates when driver accepts
- Admin Booking Overview: Enable admin to view all bookings in the `bookings` collection with assigned driver and customer information. This provides oversight to ensure bookings run smoothly and safely
- Real-Time ETA Update: Generate estimated time of arrival using a tool. Display ETA information based on a large-language model tool, including incorporation of real-time traffic data.

## Style Guidelines:

- System Blue → #007AFF
- System Green → #34C759
- System Red → #FF3B30
- System Orange → #FF9500
- System Yellow → #FFCC00
- System Purple → #AF52DE
- System Teal → #5AC8FA
- System Gray → #8E8E93
- System Background → #FFFFFF
- Secondary Background → #F2F2F7
- Tertiary Background → #FFFFFF
- Primary Label → #000000
- Secondary Label → #3C3C43
- Tertiary Label → #6C6C70
- Quaternary Label → #8E8E93