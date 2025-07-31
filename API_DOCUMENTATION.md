# Rentiful API Documentation

## Overview
The Rentiful API provides comprehensive backend services for a modern property rental platform. This documentation covers all available endpoints, features, and categories.

## Base URL
```
https://your-api-domain.com/api
```

## Authentication
All protected endpoints require authentication via JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🏠 Property Management

### Get All Properties
```http
GET /properties
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `propertyType` (optional): Filter by property type
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `amenities` (optional): Comma-separated list of amenities
- `city` (optional): Filter by city
- `isAvailable` (optional): Filter by availability

**Response:**
```json
{
  "properties": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### Get Property by ID
```http
GET /properties/{id}
```

### Create Property (Manager Only)
```http
POST /properties
Content-Type: multipart/form-data
```

**Body:**
- `name`: Property name
- `description`: Property description
- `pricePerMonth`: Monthly rent
- `securityDeposit`: Security deposit amount
- `applicationFee`: Application fee
- `beds`: Number of bedrooms
- `baths`: Number of bathrooms
- `squareFeet`: Square footage
- `propertyType`: Type of property
- `amenities`: Array of amenities
- `highlights`: Array of highlights
- `isPetsAllowed`: Boolean
- `isParkingIncluded`: Boolean
- `photos`: Array of image files
- `locationId`: Location ID

---

## ⭐ Reviews & Ratings System

### Get Property Reviews
```http
GET /reviews/property/{propertyId}
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `rating` (optional): Filter by rating (1-5)

### Get Average Rating
```http
GET /reviews/property/{propertyId}/average
```

### Create Review (Tenant Only)
```http
POST /reviews
```

**Body:**
```json
{
  "propertyId": 1,
  "rating": 5,
  "comment": "Great property, highly recommend!"
}
```

### Update Review (Tenant Only)
```http
PUT /reviews/{id}
```

### Delete Review (Tenant Only)
```http
DELETE /reviews/{id}
```

### Verify Review (Manager Only)
```http
PATCH /reviews/{id}/verify
```

---

## 📄 Document Management System

### Get Documents
```http
GET /documents
```

**Query Parameters:**
- `type` (optional): Document type
- `propertyId` (optional): Filter by property
- `leaseId` (optional): Filter by lease
- `signed` (optional): Filter by signature status

### Upload Documents
```http
POST /documents
Content-Type: multipart/form-data
```

**Body:**
- `files`: Array of files
- `type`: Document type
- `propertyId` (optional): Property ID
- `leaseId` (optional): Lease ID
- `title`: Document title

### Get Documents by Type
```http
GET /documents/type/{type}
```

### Get Documents by Property
```http
GET /documents/property/{propertyId}
```

### Get Documents by Lease
```http
GET /documents/lease/{leaseId}
```

### Sign Document
```http
PATCH /documents/{id}/sign
```

**Body:**
```json
{
  "signatureUrl": "https://example.com/signature.pdf"
}
```

---

## 📊 Analytics & Reporting

### Property Analytics
```http
GET /analytics/properties
```

**Query Parameters:**
- `startDate` (optional): Start date for analytics
- `endDate` (optional): End date for analytics
- `propertyId` (optional): Specific property ID

### Financial Analytics
```http
GET /analytics/financial
```

### Occupancy Analytics
```http
GET /analytics/occupancy
```

### Maintenance Analytics
```http
GET /analytics/maintenance
```

### Application Analytics
```http
GET /analytics/applications
```

### Revenue Analytics
```http
GET /analytics/financial/revenue
```

### Tenant Analytics
```http
GET /analytics/tenants
```

### Custom Report
```http
POST /analytics/custom
```

**Body:**
```json
{
  "reportType": "property_performance",
  "filters": {
    "dateRange": "2024-01-01 to 2024-12-31",
    "propertyType": "Apartment"
  },
  "groupBy": "month",
  "sortBy": "revenue"
}
```

### Export Analytics
```http
GET /analytics/export/{type}?format=csv
```

---

## 🔍 Advanced Search & Filtering

### Search Properties
```http
GET /search/properties
```

**Query Parameters:**
- `query`: Search term
- `minPrice` / `maxPrice`: Price range
- `minBeds` / `maxBeds`: Bedroom range
- `minBaths` / `maxBaths`: Bathroom range
- `propertyType`: Property type
- `amenities`: Comma-separated amenities
- `highlights`: Comma-separated highlights
- `petsAllowed`: Boolean
- `parkingIncluded`: Boolean
- `city` / `state` / `postalCode`: Location filters
- `radius`: Search radius in km
- `latitude` / `longitude`: Coordinates
- `availableFrom` / `availableTo`: Availability dates
- `sortBy`: Sort field (price, beds, rating, date)
- `sortOrder`: asc or desc

### Search by Location
```http
GET /search/location
```

### Search by Price
```http
GET /search/price
```

### Search by Amenities
```http
GET /search/amenities?amenities=Pool,Gym
```

### Search by Availability
```http
GET /search/availability?availableFrom=2024-06-01&availableTo=2024-06-30
```

### Get Search Suggestions
```http
GET /search/suggestions?query=downtown
```

### Get Popular Searches
```http
GET /search/popular
```

### Save Search (Authenticated)
```http
POST /search/saved
```

**Body:**
```json
{
  "name": "Downtown Apartments",
  "filters": {
    "city": "Downtown",
    "maxPrice": 2000,
    "amenities": ["Pool", "Gym"]
  }
}
```

### Get Saved Searches (Authenticated)
```http
GET /search/saved
```

---

## 📅 Booking & Viewing System

### Create Viewing Request (Tenant Only)
```http
POST /bookings/viewings
```

**Body:**
```json
{
  "propertyId": 1,
  "preferredDate": "2024-06-15",
  "preferredTime": "14:00",
  "notes": "I'm interested in this property",
  "contactPreference": "email"
}
```

### Get Viewings (Authenticated)
```http
GET /bookings/viewings
```

**Query Parameters:**
- `status`: Viewing status
- `propertyId`: Property ID
- `page` / `limit`: Pagination

### Get Available Time Slots
```http
GET /bookings/slots/{propertyId}?date=2024-06-15
```

### Update Viewing
```http
PUT /bookings/viewings/{id}
```

### Cancel Viewing
```http
DELETE /bookings/viewings/{id}
```

**Body:**
```json
{
  "reason": "Schedule conflict"
}
```

### Confirm Viewing (Manager Only)
```http
PATCH /bookings/viewings/{id}/confirm
```

**Body:**
```json
{
  "confirmedDate": "2024-06-15",
  "confirmedTime": "14:00",
  "notes": "Confirmed viewing"
}
```

### Create Virtual Tour (Manager Only)
```http
POST /bookings/virtual-tours
```

**Body:**
```json
{
  "propertyId": 1,
  "tourUrl": "https://example.com/virtual-tour",
  "description": "360° virtual tour of the property",
  "isActive": true
}
```

### Get Virtual Tours
```http
GET /bookings/virtual-tours
```

### Schedule Follow-up (Manager Only)
```http
POST /bookings/follow-up
```

**Body:**
```json
{
  "viewingId": 1,
  "followUpDate": "2024-06-16",
  "followUpTime": "10:00",
  "notes": "Follow up on viewing",
  "type": "Phone"
}
```

---

## 💬 Communication Hub

### Get Messages
```http
GET /messages
```

### Send Message
```http
POST /messages
```

**Body:**
```json
{
  "content": "Hello, I'm interested in your property",
  "receiverId": "user123",
  "receiverType": "manager"
}
```

### Mark Message as Read
```http
PATCH /messages/{id}/read
```

---

## 🔔 Notifications

### Get Notifications
```http
GET /notifications
```

### Mark Notification as Read
```http
PATCH /notifications/{id}/read
```

---

## 💰 Payment Management

### Get Payments
```http
GET /payments
```

### Create Payment
```http
POST /payments
```

**Body:**
```json
{
  "leaseId": 1,
  "amountDue": 1500,
  "dueDate": "2024-06-01",
  "paymentMethod": "CreditCard"
}
```

### Update Payment Status
```http
PATCH /payments/{id}/status
```

---

## 🛠️ Maintenance Requests

### Get Maintenance Requests
```http
GET /maintenance
```

### Create Maintenance Request
```http
POST /maintenance
```

**Body:**
```json
{
  "propertyId": 1,
  "title": "Leaky faucet",
  "description": "The kitchen faucet is leaking",
  "priority": "Medium",
  "photos": ["url1", "url2"]
}
```

### Update Maintenance Request
```http
PUT /maintenance/{id}
```

---

## 📋 Applications

### Get Applications
```http
GET /applications
```

### Submit Application
```http
POST /applications
```

**Body:**
```json
{
  "propertyId": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "message": "I'm interested in this property",
  "income": 50000,
  "creditScore": 750,
  "employmentStatus": "Full-time"
}
```

### Update Application Status
```http
PATCH /applications/{id}/status
```

---

## 📄 Leases

### Get Leases
```http
GET /leases
```

### Create Lease
```http
POST /leases
```

**Body:**
```json
{
  "propertyId": 1,
  "tenantCognitoId": "tenant123",
  "startDate": "2024-06-01",
  "endDate": "2025-05-31",
  "rent": 1500,
  "deposit": 1500
}
```

---

## 👥 User Management

### Get Manager Profile
```http
GET /managers/profile
```

### Update Manager Profile
```http
PUT /managers/profile
```

### Get Tenant Profile
```http
GET /tenants/profile
```

### Update Tenant Profile
```http
PUT /tenants/profile
```

---

## 🏢 Property Categories

The platform supports various property types and categories:

### Property Types
- **Rooms**: Individual rooms for rent
- **Tinyhouse**: Compact living spaces
- **Apartment**: Multi-unit residential buildings
- **Villa**: Large, luxurious houses
- **Townhouse**: Multi-story attached homes
- **Cottage**: Small, cozy houses

### Amenities
- Washer/Dryer
- Air Conditioning
- Dishwasher
- High-Speed Internet
- Hardwood Floors
- Walk-in Closets
- Microwave
- Refrigerator
- Pool
- Gym
- Parking
- Pets Allowed
- WiFi

### Highlights
- High-Speed Internet Access
- Washer/Dryer
- Air Conditioning
- Heating
- Smoke-Free
- Cable Ready
- Satellite TV
- Double Vanities
- Tub/Shower
- Intercom
- Sprinkler System
- Recently Renovated
- Close to Transit
- Great View
- Quiet Neighborhood

---

## 📊 Analytics Categories

### Financial Analytics
- Revenue tracking
- Payment analysis
- Profit margins
- Outstanding payments
- Monthly/yearly trends

### Property Performance
- Occupancy rates
- Application conversion rates
- Maintenance costs
- Average ratings
- Viewing statistics

### Tenant Analytics
- Payment behavior
- Lease duration
- Communication patterns
- Satisfaction scores
- Renewal rates

### Maintenance Analytics
- Request frequency
- Response times
- Cost analysis
- Priority distribution
- Completion rates

---

## 🔍 Search Categories

### Location-Based Search
- City/State filtering
- Radius-based search
- Neighborhood preferences
- School district proximity
- Crime rate considerations

### Price-Based Search
- Monthly rent ranges
- Security deposit amounts
- Application fees
- Utility costs
- Total cost calculations

### Feature-Based Search
- Amenity requirements
- Property highlights
- Pet policies
- Parking availability
- Accessibility features

### Availability Search
- Move-in dates
- Lease terms
- Immediate availability
- Future availability
- Flexible dates

---

## 📅 Booking Categories

### Viewing Types
- **In-Person Viewings**: Physical property tours
- **Virtual Tours**: Online property exploration
- **Video Calls**: Remote property discussions
- **Self-Guided Tours**: Keyless entry viewings

### Follow-up Types
- **Phone Calls**: Direct communication
- **Email**: Written correspondence
- **In-Person Meetings**: Face-to-face discussions
- **Video Calls**: Remote meetings

### Scheduling Options
- **Business Hours**: 9 AM - 6 PM
- **Weekend Viewings**: Saturday/Sunday availability
- **Evening Appointments**: After-hours viewings
- **Flexible Scheduling**: Custom time slots

---

## 🚀 Getting Started

1. **Authentication**: Obtain JWT token via login
2. **API Base URL**: Use the provided base URL
3. **Headers**: Include Authorization and Content-Type headers
4. **Rate Limiting**: Respect API rate limits
5. **Error Handling**: Check response status codes and error messages

## 📝 Error Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## 🔧 Rate Limiting

- General endpoints: 100 requests/minute
- Authentication endpoints: 10 requests/minute
- File upload endpoints: 20 requests/minute

## 📞 Support

For API support and questions, contact:
- Email: api-support@rentiful.com
- Documentation: https://docs.rentiful.com
- Status: https://status.rentiful.com 