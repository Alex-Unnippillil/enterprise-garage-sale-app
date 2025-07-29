# 📚 API Documentation

This document provides comprehensive documentation for the Rentiful real estate application API.

## 🔐 Authentication

All API endpoints require authentication using AWS Cognito JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📋 Base URL

```
Development: http://localhost:3002
Production: https://your-domain.com
```

## 🏠 Property Endpoints

### Get All Properties

**GET** `/properties`

Retrieve all properties with optional filtering.

**Query Parameters:**
- `location` (string): Filter by location
- `priceMin` (number): Minimum price
- `priceMax` (number): Maximum price
- `beds` (string): Number of bedrooms
- `baths` (string): Number of bathrooms
- `propertyType` (string): Type of property
- `amenities` (string): Comma-separated amenities
- `latitude` (number): Latitude for location-based search
- `longitude` (number): Longitude for location-based search

**Response:**
```json
{
  "properties": [
    {
      "id": 1,
      "name": "Sunset Apartments - Unit 3B",
      "description": "Beautiful 2-bedroom apartment with ocean view",
      "pricePerMonth": 2500,
      "securityDeposit": 2500,
      "applicationFee": 100,
      "photoUrls": ["https://example.com/image1.jpg"],
      "amenities": ["WasherDryer", "AirConditioning"],
      "highlights": ["GreatView", "RecentlyRenovated"],
      "isPetsAllowed": true,
      "isParkingIncluded": true,
      "beds": 2,
      "baths": 2,
      "squareFeet": 1200,
      "propertyType": "Apartment",
      "postedDate": "2024-01-15T10:00:00Z",
      "averageRating": 4.5,
      "numberOfReviews": 12,
      "location": {
        "address": "123 Sunset Blvd",
        "city": "Los Angeles",
        "state": "CA",
        "country": "USA",
        "postalCode": "90210"
      }
    }
  ]
}
```

### Get Property by ID

**GET** `/properties/:id`

Retrieve a specific property by ID.

**Response:**
```json
{
  "id": 1,
  "name": "Sunset Apartments - Unit 3B",
  "description": "Beautiful 2-bedroom apartment with ocean view",
  "pricePerMonth": 2500,
  "securityDeposit": 2500,
  "applicationFee": 100,
  "photoUrls": ["https://example.com/image1.jpg"],
  "amenities": ["WasherDryer", "AirConditioning"],
  "highlights": ["GreatView", "RecentlyRenovated"],
  "isPetsAllowed": true,
  "isParkingIncluded": true,
  "beds": 2,
  "baths": 2,
  "squareFeet": 1200,
  "propertyType": "Apartment",
  "postedDate": "2024-01-15T10:00:00Z",
  "averageRating": 4.5,
  "numberOfReviews": 12,
  "location": {
    "id": 1,
    "address": "123 Sunset Blvd",
    "city": "Los Angeles",
    "state": "CA",
    "country": "USA",
    "postalCode": "90210",
    "coordinates": {
      "latitude": 34.0522,
      "longitude": -118.2437
    }
  },
  "manager": {
    "id": 1,
    "name": "John Smith",
    "email": "john@example.com",
    "phoneNumber": "+1234567890"
  }
}
```

### Create Property

**POST** `/properties`

Create a new property listing. Requires manager authentication.

**Request Body:**
```json
{
  "name": "New Property",
  "description": "Property description",
  "pricePerMonth": 2500,
  "securityDeposit": 2500,
  "applicationFee": 100,
  "isPetsAllowed": true,
  "isParkingIncluded": true,
  "beds": 2,
  "baths": 2,
  "squareFeet": 1200,
  "propertyType": "Apartment",
  "amenities": ["WasherDryer", "AirConditioning"],
  "highlights": ["GreatView"],
  "address": "123 Main St",
  "city": "Los Angeles",
  "state": "CA",
  "country": "USA",
  "postalCode": "90210",
  "photos": [File1, File2, ...]
}
```

**Response:**
```json
{
  "id": 1,
  "message": "Property created successfully"
}
```

### Update Property

**PUT** `/properties/:id`

Update an existing property. Requires manager authentication.

**Request Body:** Same as create property

**Response:**
```json
{
  "message": "Property updated successfully"
}
```

### Delete Property

**DELETE** `/properties/:id`

Delete a property. Requires manager authentication.

**Response:**
```json
{
  "message": "Property deleted successfully"
}
```

## 👥 User Management

### Get Current User

**GET** `/tenants/:userId` or `/managers/:userId`

Retrieve current user information.

**Response:**
```json
{
  "id": 1,
  "cognitoId": "user-uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890"
}
```

### Update User Profile

**PUT** `/tenants/:userId` or `/managers/:userId`

Update user profile information.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully"
}
```

## 📝 Application Endpoints

### Get Applications

**GET** `/applications`

Retrieve applications. For tenants, returns their applications. For managers, returns applications for their properties.

**Query Parameters:**
- `status` (string): Filter by status (Pending, Approved, Denied)
- `propertyId` (number): Filter by property ID

**Response:**
```json
{
  "applications": [
    {
      "id": 1,
      "applicationDate": "2024-01-15T10:00:00Z",
      "status": "Pending",
      "name": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "message": "I'm interested in this property",
      "property": {
        "id": 1,
        "name": "Sunset Apartments - Unit 3B"
      },
      "tenant": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

### Create Application

**POST** `/applications`

Submit a new application for a property.

**Request Body:**
```json
{
  "propertyId": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "message": "I'm interested in this property"
}
```

**Response:**
```json
{
  "id": 1,
  "message": "Application submitted successfully"
}
```

### Update Application Status

**PUT** `/applications/:id`

Update application status. Requires manager authentication.

**Request Body:**
```json
{
  "status": "Approved"
}
```

**Response:**
```json
{
  "message": "Application status updated successfully"
}
```

## 🏠 Lease Endpoints

### Get Leases

**GET** `/leases`

Retrieve leases. For tenants, returns their leases. For managers, returns leases for their properties.

**Response:**
```json
{
  "leases": [
    {
      "id": 1,
      "startDate": "2024-02-01T00:00:00Z",
      "endDate": "2025-01-31T00:00:00Z",
      "rent": 2500,
      "deposit": 2500,
      "property": {
        "id": 1,
        "name": "Sunset Apartments - Unit 3B"
      },
      "tenant": {
        "id": 1,
        "name": "John Doe"
      }
    }
  ]
}
```

### Create Lease

**POST** `/leases`

Create a new lease agreement. Requires manager authentication.

**Request Body:**
```json
{
  "propertyId": 1,
  "tenantCognitoId": "tenant-uuid",
  "startDate": "2024-02-01",
  "endDate": "2025-01-31",
  "rent": 2500,
  "deposit": 2500
}
```

**Response:**
```json
{
  "id": 1,
  "message": "Lease created successfully"
}
```

## 💰 Payment Endpoints

### Get Payments

**GET** `/payments`

Retrieve payments for leases.

**Query Parameters:**
- `leaseId` (number): Filter by lease ID
- `status` (string): Filter by payment status

**Response:**
```json
{
  "payments": [
    {
      "id": 1,
      "amountDue": 2500,
      "amountPaid": 2500,
      "dueDate": "2024-02-01T00:00:00Z",
      "paymentDate": "2024-02-01T00:00:00Z",
      "paymentStatus": "Paid",
      "lease": {
        "id": 1,
        "property": {
          "name": "Sunset Apartments - Unit 3B"
        }
      }
    }
  ]
}
```

### Create Payment

**POST** `/payments`

Create a new payment record.

**Request Body:**
```json
{
  "leaseId": 1,
  "amountDue": 2500,
  "amountPaid": 2500,
  "dueDate": "2024-02-01",
  "paymentDate": "2024-02-01",
  "paymentStatus": "Paid"
}
```

**Response:**
```json
{
  "id": 1,
  "message": "Payment created successfully"
}
```

## 🔍 Search and Filtering

### Advanced Property Search

**GET** `/properties/search`

Advanced property search with multiple filters.

**Query Parameters:**
- `location` (string): Location search
- `priceMin` (number): Minimum price
- `priceMax` (number): Maximum price
- `beds` (string): Number of bedrooms
- `baths` (string): Number of bathrooms
- `propertyType` (string): Property type
- `amenities` (string): Comma-separated amenities
- `highlights` (string): Comma-separated highlights
- `squareFeetMin` (number): Minimum square feet
- `squareFeetMax` (number): Maximum square feet
- `availableFrom` (string): Available from date
- `latitude` (number): Latitude for location search
- `longitude` (number): Longitude for location search
- `radius` (number): Search radius in miles

**Response:**
```json
{
  "properties": [...],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

## 📊 Analytics Endpoints

### Get Manager Analytics

**GET** `/managers/:userId/analytics`

Get analytics data for property managers.

**Response:**
```json
{
  "totalProperties": 10,
  "totalApplications": 25,
  "totalRevenue": 45000,
  "occupancyRate": 85,
  "averageRating": 4.2,
  "monthlyRevenue": [
    {
      "month": "2024-01",
      "revenue": 12000
    }
  ],
  "propertyTypes": [
    {
      "type": "Apartment",
      "count": 8
    }
  ],
  "applicationStatus": [
    {
      "status": "Pending",
      "count": 10
    }
  ]
}
```

## 🗺 Location Endpoints

### Geocode Address

**POST** `/locations/geocode`

Convert address to coordinates.

**Request Body:**
```json
{
  "address": "123 Main St, Los Angeles, CA 90210"
}
```

**Response:**
```json
{
  "latitude": 34.0522,
  "longitude": -118.2437
}
```

### Get Nearby Properties

**GET** `/properties/nearby`

Find properties near a location.

**Query Parameters:**
- `latitude` (number): Latitude
- `longitude` (number): Longitude
- `radius` (number): Search radius in miles

**Response:**
```json
{
  "properties": [...],
  "total": 15
}
```

## 📁 File Upload

### Upload Property Images

**POST** `/upload/property-images`

Upload images for a property.

**Request Body:**
```
Content-Type: multipart/form-data

photos: [File1, File2, ...]
propertyId: 1
```

**Response:**
```json
{
  "urls": [
    "https://s3.amazonaws.com/bucket/image1.jpg",
    "https://s3.amazonaws.com/bucket/image2.jpg"
  ]
}
```

## 🔒 Error Responses

### Authentication Error

**Status:** 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### Authorization Error

**Status:** 403 Forbidden

```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### Validation Error

**Status:** 400 Bad Request

```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "details": {
    "field": "pricePerMonth",
    "message": "Price must be a positive number"
  }
}
```

### Not Found Error

**Status:** 404 Not Found

```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### Server Error

**Status:** 500 Internal Server Error

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## 📝 Rate Limiting

The API implements rate limiting to prevent abuse:

- **General endpoints**: 100 requests per minute
- **Search endpoints**: 50 requests per minute
- **File upload**: 10 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642234567
```

## 🔧 Pagination

List endpoints support pagination:

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)

**Response Headers:**
```
X-Total-Count: 150
X-Page-Count: 15
X-Current-Page: 1
```

## 📊 Data Types

### Property Types
- `Rooms`
- `Tinyhouse`
- `Apartment`
- `Villa`
- `Townhouse`
- `Cottage`

### Application Status
- `Pending`
- `Approved`
- `Denied`

### Payment Status
- `Pending`
- `Paid`
- `PartiallyPaid`
- `Overdue`

### Amenities
- `WasherDryer`
- `AirConditioning`
- `Dishwasher`
- `HighSpeedInternet`
- `HardwoodFloors`
- `WalkInClosets`
- `Microwave`
- `Refrigerator`
- `Pool`
- `Gym`
- `Parking`
- `PetsAllowed`
- `WiFi`

### Highlights
- `HighSpeedInternetAccess`
- `WasherDryer`
- `AirConditioning`
- `Heating`
- `SmokeFree`
- `CableReady`
- `SatelliteTV`
- `DoubleVanities`
- `TubShower`
- `Intercom`
- `SprinklerSystem`
- `RecentlyRenovated`
- `CloseToTransit`
- `GreatView`
- `QuietNeighborhood`

## 🚀 SDK Examples

### JavaScript/TypeScript

```javascript
// Get properties
const response = await fetch('/api/properties', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Create application
const application = await fetch('/api/applications', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    propertyId: 1,
    name: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '+1234567890',
    message: 'I\'m interested in this property'
  })
});
```

### cURL Examples

```bash
# Get properties
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3002/properties"

# Create application
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"propertyId": 1, "name": "John Doe"}' \
  "http://localhost:3002/applications"
```

## 📞 Support

For API support:
- Check the error responses for specific issues
- Review the request/response examples
- Contact the development team for additional help

---

**Note**: This API documentation is for version 1.0. All endpoints are subject to change in future versions. 