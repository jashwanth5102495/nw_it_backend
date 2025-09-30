# Payment & Referral System API Documentation

## Overview

This document describes the clean, streamlined payment and referral system. The system properly handles referral codes through the Payment model, eliminating redundancy and confusion.

## Key Improvements Made

1. **Removed referral code from Student model** - Now only stored in Payment records
2. **Centralized payment logic** - All payment operations go through the Payment model
3. **Proper faculty-student relationship** - Tracked through Payment records with facultyId
4. **Clean data flow** - No redundant code, clear separation of concerns
5. **Comprehensive analytics** - Better reporting and commission tracking

## Core Models

### Payment Model
```javascript
{
  paymentId: String,           // Unique payment identifier
  studentId: ObjectId,         // Reference to Student
  courseId: ObjectId,          // Reference to Course
  courseName: String,          // Course title for quick reference
  amount: Number,              // Final amount paid (after discount)
  originalAmount: Number,      // Original course price
  transactionId: String,       // Transaction reference
  studentName: String,         // Student full name
  studentEmail: String,        // Student email
  status: String,              // 'pending', 'completed', 'failed', 'refunded'
  confirmationStatus: String,  // 'waiting_for_confirmation', 'confirmed', 'rejected'
  paymentMethod: String,       // 'online', 'manual_qr', etc.
  
  // Referral System Fields
  referralCode: String,        // Faculty referral code (uppercase)
  facultyId: ObjectId,         // Reference to Faculty member
  discountAmount: Number,      // Discount given to student
  commissionAmount: Number,    // Commission for faculty
  commissionPaid: Boolean,     // Whether commission has been paid
  commissionPaidDate: Date     // When commission was paid
}
```

### Faculty Model
```javascript
{
  name: String,
  email: String,
  referralCode: String,        // Unique uppercase code
  commissionRate: Number,      // Default 0.60 (60% discount/commission)
  isActive: Boolean,
  totalCommissionsEarned: Number,
  totalReferrals: Number
}
```

## API Endpoints

### Student Enrollment (Clean Flow)

#### 1. Enroll Student with Payment
```http
POST /api/students/:id/enroll
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "courseId": "FRONTEND_ADV",
  "paymentDetails": {
    "amount": 50000,
    "method": "online",
    "transactionId": "TXN123456789"
  },
  "referralCode": "JOHN1234"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully enrolled in course",
  "data": {
    "courseId": "FRONTEND_ADV",
    "courseTitle": "Advanced Frontend Development",
    "enrollmentDate": "2025-09-30T10:00:00.000Z",
    "paymentId": "PAY_1727694000000_abc123",
    "finalPrice": 20000,        // After 60% discount
    "originalPrice": 50000,     // Original price
    "discountApplied": true,
    "discountAmount": 30000     // Amount saved
  }
}
```

### Course Purchase (Alternative Flow)

#### 1. Purchase Course Directly
```http
POST /api/courses/purchase
Content-Type: application/json

{
  "courseId": "FRONTEND_ADV",
  "studentId": "student@example.com",  // Can use email or studentId
  "paymentId": "TXN123456789",
  "referralCode": "JOHN1234"           // Optional
}
```

### Referral System

#### 1. Validate Referral Code
```http
POST /api/analytics/validate-referral
Content-Type: application/json

{
  "referralCode": "JOHN1234",
  "coursePrice": 50000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Valid referral code",
  "data": {
    "facultyName": "John Doe",
    "facultyEmail": "john@example.com",
    "referralCode": "JOHN1234",
    "isValid": true,
    "pricing": {
      "originalPrice": 50000,
      "discountAmount": 30000,
      "finalPrice": 20000,
      "commission": 30000
    }
  }
}
```

#### 2. Get Students by Referral Code (Faculty Performance)
```http
GET /api/students/by-referral/JOHN1234
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f9b8c1d4e5f6a7b8c9d0e1",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "studentId": "STU-ABCD1234",
      "selectedCourse": "Advanced Frontend Development",
      "courseId": "64f9b8c1d4e5f6a7b8c9d0e2",
      "originalPrice": 50000,
      "finalPrice": 20000,
      "discountAmount": 30000,
      "commissionAmount": 30000,
      "paymentStatus": "completed",
      "confirmationStatus": "confirmed",
      "referralCode": "JOHN1234",
      "transactionId": "TXN123456789",
      "paymentDate": "2025-09-30T10:00:00.000Z",
      "commissionPaid": false
    }
  ],
  "summary": {
    "facultyName": "John Doe",
    "facultyEmail": "john@example.com",
    "totalStudents": 15,
    "totalRevenue": 300000,
    "totalCommissions": 450000,
    "paidCommissions": 150000,
    "unpaidCommissions": 300000
  },
  "count": 15
}
```

### Faculty Management

#### 1. Get Faculty Performance
```http
GET /api/analytics/faculty/performance
```

#### 2. Create Faculty Member
```http
POST /api/faculty/create
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "referralCode": "JOHN1234",
  "commissionRate": 0.60
}
```

#### 3. Get Faculty Commission Details
```http
GET /api/analytics/faculty/64f9b8c1d4e5f6a7b8c9d0e1/commissions?status=completed&page=1&limit=20
```

### Payment Management

#### 1. Get All Payments (Admin)
```http
GET /api/payments?status=completed&page=1&limit=20&sortBy=paymentDate&sortOrder=desc
```

#### 2. Update Payment Confirmation Status
```http
PUT /api/payments/PAY_1727694000000_abc123/confirm
Content-Type: application/json

{
  "confirmationStatus": "confirmed",
  "adminEmail": "admin@example.com"
}
```

#### 3. Mark Commission as Paid
```http
PATCH /api/faculty/commission/64f9b8c1d4e5f6a7b8c9d0e1/mark-paid
```

#### 4. Bulk Update Commission Status
```http
POST /api/analytics/commissions/bulk-update
Content-Type: application/json

{
  "paymentIds": ["64f9b8c1d4e5f6a7b8c9d0e1", "64f9b8c1d4e5f6a7b8c9d0e2"],
  "action": "mark_paid"
}
```

### Analytics & Reporting

#### 1. Payment Analytics Dashboard
```http
GET /api/analytics/dashboard?timeframe=30d
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalPayments": 150,
      "totalRevenue": 3000000,
      "completedPayments": 140,
      "pendingPayments": 10,
      "averagePayment": 20000
    },
    "referrals": {
      "totalReferralPayments": 45,
      "totalCommissions": 1350000,
      "totalDiscounts": 1350000,
      "paidCommissions": 450000
    },
    "topFaculty": [
      {
        "name": "John Doe",
        "email": "john@example.com",
        "referralCode": "JOHN1234",
        "referralCount": 15,
        "totalCommissions": 450000,
        "totalRevenue": 300000
      }
    ],
    "courseRevenue": [
      {
        "courseName": "Advanced Frontend Development",
        "totalRevenue": 800000,
        "totalEnrollments": 40,
        "averagePrice": 20000
      }
    ],
    "dailyTrends": [...],
    "timeframe": "30d"
  }
}
```

## Frontend Integration Examples

### 1. Course Purchase with Referral
```javascript
const purchaseCourse = async (courseId, studentId, referralCode = null) => {
  try {
    // 1. Validate referral code if provided
    if (referralCode) {
      const validation = await fetch('/api/analytics/validate-referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referralCode,
          coursePrice: course.price
        })
      });
      
      const validationResult = await validation.json();
      if (!validationResult.success) {
        throw new Error('Invalid referral code');
      }
      
      // Show discount to user
      console.log(`Discount: ₹${validationResult.data.pricing.discountAmount}`);
    }
    
    // 2. Process payment
    const response = await fetch('/api/courses/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId,
        studentId,
        paymentId: generateTransactionId(),
        referralCode
      })
    });
    
    const result = await response.json();
    if (result.success) {
      // Payment successful - redirect to course or show success
      console.log('Course purchased successfully!');
    }
    
  } catch (error) {
    console.error('Purchase failed:', error);
  }
};
```

### 2. Admin Panel - Faculty Management
```javascript
const getFacultyPerformance = async () => {
  const response = await fetch('/api/analytics/faculty/performance');
  const data = await response.json();
  
  return data.data.map(faculty => ({
    ...faculty,
    conversionRate: `${(faculty.conversionRate * 100).toFixed(1)}%`,
    unpaidCommissions: faculty.unpaidCommissions || 0
  }));
};

const getStudentsByReferral = async (referralCode) => {
  const response = await fetch(`/api/students/by-referral/${referralCode}`);
  const data = await response.json();
  
  return {
    students: data.data,
    summary: data.summary
  };
};
```

## Key Benefits

1. **Clean Data Flow**: Referral codes only stored in Payment records, eliminating confusion
2. **Proper Relationships**: Faculty-Student relationships tracked through payments
3. **Complete Analytics**: Comprehensive reporting on commissions, referrals, and performance
4. **Easy Commission Management**: Bulk operations for marking commissions as paid/unpaid
5. **Backward Compatibility**: Existing Student payment history maintained
6. **Validation**: Proper referral code validation before processing payments
7. **Admin Friendly**: Clear admin interfaces for managing payments and commissions

This cleaned-up system eliminates the redundant code and provides a clear, intuitive payment flow that's easy to maintain and extend.