# Document Management Feature

## Overview

The Document Management System is a comprehensive feature that allows tenants and property managers to upload, organize, and manage documents related to properties, leases, maintenance, and other important files.

## Features

### 🔐 Role-Based Access Control
- **Managers**: Can view and manage all documents across all properties
- **Tenants**: Can only view documents related to their leased properties or public documents
- **Upload Permissions**: Users can upload documents to properties they manage or lease

### 📁 Document Organization
- **Categories**: Lease Agreement, Maintenance, Property Photos, Financial, Legal, Other
- **Types**: PDF, Image, Document, Spreadsheet, Other
- **Public/Private**: Documents can be marked as public or private
- **Property Association**: Documents can be linked to specific properties

### 🔍 Search and Filter
- **Text Search**: Search by document name or description
- **Category Filter**: Filter by document category
- **Type Filter**: Filter by document type
- **Real-time Results**: Instant filtering and search results

### 📱 User Interface
- **Grid View**: Card-based layout for visual browsing
- **List View**: Compact list view for detailed information
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Drag & Drop**: Intuitive file upload interface

### 🛡️ Security Features
- **File Type Validation**: Only allows safe file types (PDF, images, documents)
- **File Size Limits**: 10MB maximum file size
- **Access Control**: Role-based permissions
- **Secure Downloads**: Authenticated file downloads

## Technical Implementation

### Backend (Node.js/Express)

#### Database Schema
```sql
model Document {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  type        String   // PDF, Image, Document, Spreadsheet, Other
  category    String   // Lease Agreement, Maintenance, Property Photos, Financial, Legal, Other
  filePath    String
  fileName    String
  fileSize    Int
  propertyId  Int?
  isPublic    Boolean  @default(false)
  uploadedById String
  uploadedAt  DateTime @default(now())
  updatedAt   DateTime @updatedAt

  property      Property? @relation(fields: [propertyId], references: [id])
  uploadedByUser User?    @relation(fields: [uploadedById], references: [cognitoId])
}
```

#### API Endpoints
- `GET /api/documents` - Fetch all documents (filtered by user role)
- `POST /api/documents/upload` - Upload new document
- `GET /api/documents/:id` - Get specific document
- `PUT /api/documents/:id` - Update document metadata
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/:id/download` - Download document file
- `GET /api/documents/stats/overview` - Get document statistics

#### File Storage
- **Local Storage**: Files stored in `server/uploads/` directory
- **File Naming**: Unique filenames with timestamps
- **Path Security**: Secure file paths to prevent directory traversal

### Frontend (Next.js/React)

#### Components
- `DocumentManager` - Reusable component for document management
- `DocumentUploadForm` - Form for uploading new documents
- `DocumentCard` - Individual document display card
- `DocumentList` - List view of documents

#### Pages
- `/documents` - Main documents page
- Integrated into property details pages
- Available in maintenance request pages

#### API Integration
- **Next.js API Routes**: Proxy to backend server
- **Authentication**: JWT token forwarding
- **Error Handling**: Comprehensive error handling and user feedback

## Usage Examples

### For Property Managers

1. **Upload Lease Agreements**
   - Navigate to property details page
   - Click "Upload" in the Documents section
   - Select "Lease Agreement" category
   - Upload PDF lease documents
   - Mark as private for tenant access only

2. **Manage Property Photos**
   - Upload high-quality property photos
   - Categorize as "Property Photos"
   - Mark as public for potential tenants to view

3. **Maintenance Documentation**
   - Upload maintenance reports and receipts
   - Categorize as "Maintenance"
   - Link to specific properties

### For Tenants

1. **Access Lease Documents**
   - View lease agreements for their properties
   - Download important documents
   - Search through document history

2. **Upload Maintenance Photos**
   - Upload photos of maintenance issues
   - Categorize as "Maintenance"
   - Provide visual documentation for repair requests

## File Types Supported

### Allowed File Types
- **PDF**: `.pdf` - Documents, forms, contracts
- **Images**: `.jpg`, `.jpeg`, `.png`, `.gif` - Photos, screenshots
- **Documents**: `.doc`, `.docx` - Word documents
- **Spreadsheets**: `.xls`, `.xlsx` - Excel files

### File Size Limits
- **Maximum**: 10MB per file
- **Recommended**: Under 5MB for optimal performance

## Security Considerations

### Access Control
- **Role-based permissions**: Managers see all, tenants see property-specific
- **Property association**: Documents linked to specific properties
- **Public/Private toggle**: Control document visibility

### File Security
- **Type validation**: Only safe file types allowed
- **Size limits**: Prevent abuse of storage
- **Path security**: Secure file storage paths
- **Download authentication**: Authenticated file downloads

### Data Protection
- **User privacy**: Personal documents protected
- **Property isolation**: Property-specific document access
- **Audit trail**: Track who uploaded what and when

## Integration Points

### Property Management
- Documents linked to specific properties
- Property-specific document filtering
- Integration in property detail pages

### Maintenance System
- Maintenance request documentation
- Photo uploads for repair requests
- Maintenance history tracking

### Lease Management
- Lease agreement storage
- Tenant document access
- Legal document management

### Payment System
- Payment receipts and invoices
- Financial document organization
- Payment history documentation

## Future Enhancements

### Planned Features
1. **Cloud Storage Integration**
   - AWS S3 or Google Cloud Storage
   - Automatic backup and redundancy
   - CDN for faster downloads

2. **Document Versioning**
   - Track document versions
   - Change history
   - Rollback capabilities

3. **Advanced Search**
   - Full-text search within documents
   - OCR for scanned documents
   - Metadata search

4. **Document Templates**
   - Pre-built templates for common documents
   - Auto-fill property information
   - Standardized document formats

5. **Collaboration Features**
   - Document sharing between users
   - Comments and annotations
   - Approval workflows

6. **Mobile App Integration**
   - Native mobile document management
   - Camera integration for photo uploads
   - Offline document access

## Troubleshooting

### Common Issues

1. **Upload Failures**
   - Check file size (max 10MB)
   - Verify file type is supported
   - Ensure proper authentication

2. **Access Denied**
   - Verify user role and permissions
   - Check property associations
   - Confirm document visibility settings

3. **Download Issues**
   - Verify file exists on server
   - Check authentication token
   - Ensure proper file permissions

### Performance Optimization
- **File compression**: Automatic image compression
- **Lazy loading**: Load documents on demand
- **Caching**: Browser and server-side caching
- **CDN**: Content delivery network for large files

## API Documentation

### Authentication
All document API endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Error Responses
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

### Success Responses
```json
{
  "documents": [
    {
      "id": 1,
      "name": "Lease Agreement",
      "description": "Standard lease agreement",
      "type": "PDF",
      "category": "Lease Agreement",
      "fileSize": 1024000,
      "uploadedBy": "John Doe",
      "uploadedAt": "2024-01-15T10:30:00Z",
      "isPublic": false,
      "propertyId": 123,
      "propertyName": "Sunset Apartments",
      "downloadUrl": "/api/documents/1/download"
    }
  ]
}
```

## Deployment Notes

### Environment Variables
```env
# Backend
DATABASE_URL=postgresql://...
JWT_SECRET=your_jwt_secret
UPLOAD_PATH=./uploads

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3002
```

### File Permissions
Ensure the uploads directory has proper write permissions:
```bash
chmod 755 server/uploads
```

### Storage Considerations
- Monitor disk space usage
- Implement file cleanup policies
- Consider backup strategies for uploaded files

## Contributing

When contributing to the document management feature:

1. **Follow existing patterns** for API design and component structure
2. **Add comprehensive tests** for new functionality
3. **Update documentation** for any API changes
4. **Consider security implications** of any changes
5. **Test with various file types** and sizes
6. **Verify role-based access** works correctly

## Support

For issues or questions about the document management feature:

1. Check the troubleshooting section above
2. Review API documentation
3. Test with different user roles
4. Verify file permissions and storage
5. Check server logs for detailed error messages 