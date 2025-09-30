# Student Progress Tracking System - API Documentation

## Overview

This document provides comprehensive documentation for the Student Progress Tracking System implemented in the NW IT Learning Platform. The system tracks detailed learning progress including lessons, assignments, quizzes, time spent, performance metrics, and learning analytics.

## Models

### StudentProgress Model

The core model that tracks all student learning activities:

```javascript
{
  studentId: ObjectId,          // Reference to Student
  courseId: ObjectId,           // Reference to Course
  enrollmentDate: Date,
  overallProgress: Number,      // 0-100%
  status: String,              // 'not-started', 'in-progress', 'completed', 'paused', 'dropped'
  totalTimeSpent: Number,      // in minutes
  currentSession: {
    startTime: Date,
    isActive: Boolean
  },
  modules: [{
    moduleId: String,
    moduleTitle: String,
    status: String,
    progressPercentage: Number,
    lessons: [{
      lessonId: String,
      lessonTitle: String,
      status: String,
      timeSpent: Number,
      watchProgress: Number,    // 0-100%
      notes: [{ content: String, timestamp: Date }]
    }],
    assignments: [{
      assignmentId: String,
      status: String,
      score: Number,
      attempts: [{ attemptNumber, submittedAt, score, feedback }]
    }],
    quizzes: [{
      quizId: String,
      attempts: [{ score, answers, timeSpent }],
      bestScore: Number,
      averageScore: Number
    }]
  }],
  performanceMetrics: {
    averageQuizScore: Number,
    averageAssignmentScore: Number,
    completionRate: Number,
    engagementScore: Number,
    streakDays: Number,
    longestStreak: Number
  },
  activityLog: [{
    type: String,               // 'lesson_started', 'lesson_completed', etc.
    details: Object,
    timestamp: Date
  }],
  milestones: [{
    type: String,               // 'first_lesson', 'first_module', etc.
    achievedAt: Date
  }]
}
```

## API Endpoints

### Student Progress Routes (Authentication Required)

#### 1. Get Student's Overall Progress

```http
GET /api/students/:id/progress
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "progressRecords": [...],
    "overallStats": {
      "totalCourses": 3,
      "completedCourses": 1,
      "inProgressCourses": 2,
      "totalTimeSpent": 1250,
      "averageProgress": 67,
      "totalMilestones": 8
    }
  }
}
```

#### 2. Get Course-Specific Progress

```http
GET /api/students/:id/progress/course/:courseId
Authorization: Bearer <jwt_token>
```

#### 3. Initialize Progress Tracking

```http
POST /api/students/:id/progress/initialize
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "courseId": "64f9b8c1d4e5f6a7b8c9d0e1"
}
```

#### 4. Start Learning Session

```http
POST /api/students/:id/progress/session/start
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "courseId": "64f9b8c1d4e5f6a7b8c9d0e1"
}
```

#### 5. End Learning Session

```http
POST /api/students/:id/progress/session/end
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "courseId": "64f9b8c1d4e5f6a7b8c9d0e1"
}
```

#### 6. Update Lesson Progress

```http
PUT /api/students/:id/progress/lesson
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "courseId": "64f9b8c1d4e5f6a7b8c9d0e1",
  "moduleId": "module_1",
  "lessonId": "lesson_1_1",
  "status": "completed",
  "watchProgress": 100,
  "timeSpent": 45,
  "notes": "Great explanation of React components"
}
```

#### 7. Update Assignment Progress

```http
PUT /api/students/:id/progress/assignment
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "courseId": "64f9b8c1d4e5f6a7b8c9d0e1",
  "moduleId": "module_1",
  "assignmentId": "assignment_1_1",
  "assignmentTitle": "Build a React Component",
  "status": "submitted",
  "score": 85,
  "maxScore": 100,
  "timeSpent": 120,
  "feedback": "Good work on component structure"
}
```

#### 8. Update Quiz Progress

```http
PUT /api/students/:id/progress/quiz
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "courseId": "64f9b8c1d4e5f6a7b8c9d0e1",
  "moduleId": "module_1",
  "quizId": "quiz_1_1",
  "quizTitle": "React Basics Quiz",
  "score": 92,
  "maxScore": 100,
  "timeSpent": 15,
  "answers": [
    {
      "questionId": "q1",
      "answer": "useState",
      "isCorrect": true,
      "timeSpent": 30
    }
  ]
}
```

#### 9. Get Learning Analytics

```http
GET /api/students/:id/analytics?courseId=64f9b8c1d4e5f6a7b8c9d0e1&timeframe=30d
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalCourses": 2,
      "completedCourses": 1,
      "totalTimeSpent": 1250,
      "averageEngagement": 85
    },
    "performance": {
      "averageQuizScore": 89,
      "averageAssignmentScore": 87,
      "completionRate": 78
    },
    "streaks": {
      "currentStreak": 5,
      "longestStreak": 12
    },
    "recentActivity": [...],
    "milestones": [...]
  }
}
```

### Admin/Faculty Progress Routes

#### 1. Get Course Progress Overview

```http
GET /api/progress/course/:courseId?status=in-progress&sortBy=overallProgress&sortOrder=desc&page=1&limit=20
```

#### 2. Get Analytics Overview

```http
GET /api/progress/analytics/overview?timeframe=30d
```

#### 3. Get Student Performance Report

```http
GET /api/progress/report/student/:studentId
```

#### 4. Get Completion Trends

```http
GET /api/progress/trends/completion?courseId=64f9b8c1d4e5f6a7b8c9d0e1&period=monthly
```

## Usage Examples

### Example 1: Complete Learning Session Flow

```javascript
// 1. Student logs in and starts a learning session
const startSessionResponse = await fetch('/api/students/student123/progress/session/start', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + authToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    courseId: 'course456'
  })
});

// 2. Student watches a lesson and updates progress
const lessonProgressResponse = await fetch('/api/students/student123/progress/lesson', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + authToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    courseId: 'course456',
    moduleId: 'module_1',
    lessonId: 'lesson_1_1',
    status: 'completed',
    watchProgress: 100,
    timeSpent: 45
  })
});

// 3. Student takes a quiz
const quizResponse = await fetch('/api/students/student123/progress/quiz', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + authToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    courseId: 'course456',
    moduleId: 'module_1',
    quizId: 'quiz_1_1',
    score: 85,
    maxScore: 100,
    timeSpent: 12,
    answers: [
      { questionId: 'q1', answer: 'React', isCorrect: true, timeSpent: 5 },
      { questionId: 'q2', answer: 'Component', isCorrect: true, timeSpent: 7 }
    ]
  })
});

// 4. End the session
const endSessionResponse = await fetch('/api/students/student123/progress/session/end', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + authToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    courseId: 'course456'
  })
});
```

### Example 2: Getting Progress for Dashboard

```javascript
// Get comprehensive progress data for dashboard
const progressData = await fetch('/api/students/student123/progress', {
  headers: {
    'Authorization': 'Bearer ' + authToken
  }
});

const data = await progressData.json();
console.log('Total courses:', data.data.overallStats.totalCourses);
console.log('Average progress:', data.data.overallStats.averageProgress + '%');
console.log('Time spent learning:', data.data.overallStats.totalTimeSpent + ' minutes');
```

### Example 3: Teacher Getting Course Analytics

```javascript
// Teacher/Admin getting course performance data
const courseAnalytics = await fetch('/api/progress/course/course456?sortBy=overallProgress&sortOrder=desc', {
  headers: {
    'Authorization': 'Bearer ' + adminToken
  }
});

const analytics = await courseAnalytics.json();
console.log('Course completion rate:', analytics.data.courseStats.completedStudents + '/' + analytics.data.courseStats.totalStudents);
console.log('Average progress:', analytics.data.courseStats.averageProgress + '%');
```

## Key Features

1. **Detailed Progress Tracking**: Track lesson completion, video watch progress, time spent
2. **Assignment & Quiz Management**: Handle submissions, scoring, and multiple attempts
3. **Performance Metrics**: Automatic calculation of engagement scores, completion rates
4. **Learning Analytics**: Comprehensive analytics for students and instructors
5. **Session Management**: Track active learning sessions and time spent
6. **Milestone Tracking**: Automatic milestone detection and achievement tracking
7. **Activity Logging**: Detailed activity logs for learning behavior analysis

## Integration Notes

1. **Authentication**: All student routes require JWT authentication
2. **Authorization**: Students can only access their own progress data
3. **Real-time Updates**: Progress is updated in real-time as students interact with content
4. **Performance**: Efficient queries with proper indexing for large datasets
5. **Scalability**: Designed to handle thousands of concurrent users

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development mode)"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created (for new progress records)
- `400`: Bad Request (invalid data)
- `401`: Unauthorized (invalid/missing token)
- `404`: Not Found (student/course/progress not found)
- `500`: Internal Server Error