const express = require('express');
const StudentProgress = require('../models/StudentProgress');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const AssignmentAttempt = require('../models/AssignmentAttempt');
const router = express.Router();

// Utility: resolve course by human-friendly courseId or Mongo ObjectId
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
async function resolveCourseId(courseIdParam) {
  if (!courseIdParam) return null;
  // Try ObjectId first
  if (/^[0-9a-fA-F]{24}$/.test(courseIdParam)) {
    const byId = await Course.findById(courseIdParam);
    if (byId) return byId;
  }
  // Exact courseId match
  let course = await Course.findOne({ courseId: courseIdParam });
  if (course) return course;
  // Case-insensitive courseId
  course = await Course.findOne({ courseId: new RegExp(`^${escapeRegex(courseIdParam)}$`, 'i') });
  if (course) return course;
  // Case-insensitive title match
  course = await Course.findOne({ title: new RegExp(`^${escapeRegex(courseIdParam)}$`, 'i') });
  if (course) return course;
  // Synonym mapping
  const synonyms = {
    'frontend-beginner': ['FRONTEND-BEGINNER', 'Frontend Development - Beginner'],
    'frontend-intermediate': ['FRONTEND-INTERMEDIATE', 'Frontend Development - Intermediate'],
    'frontend-advanced': ['Frontend Development - Advanced'],
    'devops-beginner': ['DEVOPS-BEGINNER', 'DevOps - Beginner'],
    'devops-intermediate': ['DEVOPS-INTERMEDIATE', 'DevOps - Intermediate'],
    'ai-tools-mastery': ['AI-TOOLS-MASTERY', 'AI Tools Mastery']
  };
  const candidates = [
    courseIdParam,
    courseIdParam.toLowerCase(),
    courseIdParam.toUpperCase(),
    ...(synonyms[courseIdParam] || [])
  ];
  for (const cand of candidates) {
    course = await Course.findOne({ courseId: cand }) || await Course.findOne({ title: cand });
    if (course) return course;
  }
  return null;
}

// Map a Course document to a normalized course key used by assignmentId prefixes
function normalizeCourseKeyFromCourse(course) {
  if (!course) return null;
  const cid = (course.courseId || '').trim();
  const title = (course.title || '').trim().toLowerCase();

  // Prefer courseId when present
  if (cid) {
    const key = cid.trim().toLowerCase();
    // Normalize common variants
    const synonyms = {
      'frontend development - beginner': 'frontend-beginner',
      'frontend development - intermediate': 'frontend-intermediate',
      'frontend development - advanced': 'frontend-advanced',
      'devops - beginner': 'devops-beginner',
      'devops - intermediate': 'devops-intermediate',
      'ai tools mastery': 'ai-tools-mastery',
      'a.i tools mastery': 'ai-tools-mastery'
    };
    if (synonyms[key]) return synonyms[key];
    return key; // e.g. 'frontend-beginner', 'ai-tools-mastery'
  }

  // Fallback based on title
  const titleMap = {
    'frontend development - beginner': 'frontend-beginner',
    'frontend development - intermediate': 'frontend-intermediate',
    'frontend development - advanced': 'frontend-advanced',
    'devops - beginner': 'devops-beginner',
    'devops - intermediate': 'devops-intermediate',
    'ai tools mastery': 'ai-tools-mastery',
    'a.i tools mastery': 'ai-tools-mastery'
  };
  return titleMap[title] || null;
}

// Utility: ensure StudentProgress record exists
async function getOrCreateProgress(studentId, courseDoc) {
  let progress = await StudentProgress.findOne({ studentId, courseId: courseDoc._id });
  if (!progress) {
    progress = new StudentProgress({
      studentId,
      courseId: courseDoc._id,
      enrollmentDate: new Date(),
      modules: [],
      overallProgress: 0,
      status: 'in-progress'
    });
  }
  return progress;
}

// ===== ADMIN/FACULTY PROGRESS ROUTES =====

// Get all students' progress for a specific course (Faculty/Admin)
router.get('/course/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { 
      status, 
      sortBy = 'overallProgress', 
      sortOrder = 'desc',
      page = 1, 
      limit = 20 
    } = req.query;

    const course = await resolveCourseId(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    let query = { courseId: course._id };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    let progressRecords = await StudentProgress.find(query)
      .populate('studentId', 'firstName lastName email studentId')
      .populate('courseId', 'title courseId category level')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    let total = await StudentProgress.countDocuments(query);

    // Strict completion check: require >=4 projects (module submissions) AND >=6 graded assignments
    const studentIds = progressRecords.map(p => p.studentId);
    const students = await Student.find({ _id: { $in: studentIds } }).select('enrolledCourses');
    const enrollmentsByStudent = new Map(
      students.map(s => [s._id.toString(), s.enrolledCourses || []])
    );

    const strictInfoByProgressId = new Map();
    for (const p of progressRecords) {
      const assignmentsCompleted = (p.modules || []).reduce((sum, m) => {
        return sum + ((m.assignments || []).filter(a => a.status === 'graded').length);
      }, 0);

      const enrollments = enrollmentsByStudent.get(p.studentId.toString()) || [];
      const enrollment = enrollments.find(e => e.courseId?.toString() === course._id.toString());
      const projectsCompleted = enrollment?.completedModules?.length || 0;

      const strictCompleted = projectsCompleted >= 4 && assignmentsCompleted >= 6;
      strictInfoByProgressId.set(p._id.toString(), { assignmentsCompleted, projectsCompleted, strictCompleted });
    }

    // If requesting completed students, enforce strict completion filtering
    if (status === 'completed') {
      progressRecords = progressRecords.filter(p => strictInfoByProgressId.get(p._id.toString())?.strictCompleted);
      total = progressRecords.length; // adjust total to reflect strict filter in this page
    }

    // Calculate course statistics with strict completion
    const allProgress = await StudentProgress.find({ courseId: course._id });
    const allStudentIds = allProgress.map(p => p.studentId);
    const allStudents = await Student.find({ _id: { $in: allStudentIds } }).select('enrolledCourses');
    const allEnrollmentsByStudent = new Map(
      allStudents.map(s => [s._id.toString(), s.enrolledCourses || []])
    );

    const completedStudentsStrict = allProgress.filter(p => {
      const assignmentsCompleted = (p.modules || []).reduce((sum, m) => sum + ((m.assignments || []).filter(a => a.status === 'graded').length), 0);
      const enrollments = allEnrollmentsByStudent.get(p.studentId.toString()) || [];
      const enrollment = enrollments.find(e => e.courseId?.toString() === course._id.toString());
      const projectsCompleted = enrollment?.completedModules?.length || 0;
      return projectsCompleted >= 4 && assignmentsCompleted >= 6;
    }).length;

    const courseStats = {
      totalStudents: allProgress.length,
      completedStudents: completedStudentsStrict,
      inProgressStudents: allProgress.filter(p => p.status === 'in-progress').length,
    };

    // Attach strict completion info to returned records
    const recordsWithStrict = progressRecords.map(p => {
      const info = strictInfoByProgressId.get(p._id.toString());
      return {
        ...p.toObject(),
        strictCompletion: {
          isCompleted: info?.strictCompleted || false,
          assignmentsCompleted: info?.assignmentsCompleted || 0,
          projectsCompleted: info?.projectsCompleted || 0
        }
      };
    });

    return res.json({
      success: true,
      data: {
        progressRecords: recordsWithStrict,
        total,
        courseStats
      }
    });
  } catch (error) {
    console.error('Error fetching course progress:', error);
    return res.status(500).json({ success: false, message: 'Error fetching course progress', error: error.message });
  }
});

// Calculate course statistics


// Get progress analytics for all courses (Admin Dashboard)
router.get('/analytics/overview', async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    const timeframeDays = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - (timeframeDays * 24 * 60 * 60 * 1000));

    const allProgress = await StudentProgress.find({
      createdAt: { $gte: startDate }
    }).populate('courseId', 'title category level')
      .populate('studentId', 'firstName lastName');

    // Overall statistics
    const overallStats = {
      totalEnrollments: allProgress.length,
      completedCourses: allProgress.filter(p => p.status === 'completed').length,
      inProgressCourses: allProgress.filter(p => p.status === 'in-progress').length,
      totalTimeSpent: allProgress.reduce((sum, p) => sum + p.totalTimeSpent, 0),
      averageCompletionRate: Math.round(
        allProgress.reduce((sum, p) => sum + p.performanceMetrics.completionRate, 0) / allProgress.length
      ) || 0
    };

    // Course category breakdown
    const categoryStats = {};
    allProgress.forEach(progress => {
      const category = progress.courseId?.category || 'Unknown';
      if (!categoryStats[category]) {
        categoryStats[category] = {
          enrollments: 0,
          completed: 0,
          averageProgress: 0,
          totalTimeSpent: 0
        };
      }
      categoryStats[category].enrollments++;
      if (progress.status === 'completed') categoryStats[category].completed++;
      categoryStats[category].averageProgress += progress.overallProgress;
      categoryStats[category].totalTimeSpent += progress.totalTimeSpent;
    });

    // Calculate averages for categories
    Object.keys(categoryStats).forEach(category => {
      const stats = categoryStats[category];
      stats.averageProgress = Math.round(stats.averageProgress / stats.enrollments);
      stats.completionRate = Math.round((stats.completed / stats.enrollments) * 100);
    });

    // Top performing students
    const topStudents = allProgress
      .sort((a, b) => b.performanceMetrics.engagementScore - a.performanceMetrics.engagementScore)
      .slice(0, 10)
      .map(p => ({
        studentId: p.studentId?.studentId,
        name: `${p.studentId?.firstName} ${p.studentId?.lastName}`,
        courseTitle: p.courseId?.title,
        progress: p.overallProgress,
        engagementScore: p.performanceMetrics.engagementScore,
        timeSpent: p.totalTimeSpent
      }));

    // Course performance ranking
    const coursePerformance = {};
    allProgress.forEach(progress => {
      const courseId = progress.courseId?._id?.toString();
      const courseTitle = progress.courseId?.title;
      
      if (!coursePerformance[courseId]) {
        coursePerformance[courseId] = {
          title: courseTitle,
          enrollments: 0,
          completed: 0,
          totalProgress: 0,
          totalEngagement: 0,
          totalTime: 0
        };
      }
      
      const perf = coursePerformance[courseId];
      perf.enrollments++;
      if (progress.status === 'completed') perf.completed++;
      perf.totalProgress += progress.overallProgress;
      perf.totalEngagement += progress.performanceMetrics.engagementScore;
      perf.totalTime += progress.totalTimeSpent;
    });

    // Convert to array and calculate averages
    const courseRankings = Object.values(coursePerformance).map(course => ({
      ...course,
      averageProgress: Math.round(course.totalProgress / course.enrollments),
      averageEngagement: Math.round(course.totalEngagement / course.enrollments),
      averageTime: Math.round(course.totalTime / course.enrollments),
      completionRate: Math.round((course.completed / course.enrollments) * 100)
    })).sort((a, b) => b.averageEngagement - a.averageEngagement);

    res.json({
      success: true,
      data: {
        overallStats,
        categoryStats,
        topStudents,
        courseRankings: courseRankings.slice(0, 10),
        timeframe
      }
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics overview',
      error: error.message
    });
  }
});

// Get detailed student performance report
router.get('/report/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await Student.findById(studentId).select('firstName lastName email studentId');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const progressRecords = await StudentProgress.find({ studentId })
      .populate('courseId', 'title category level duration')
      .sort({ lastActivityAt: -1 });

    if (!progressRecords.length) {
      return res.json({
        success: true,
        message: 'No progress data found for this student',
        data: {
          student,
          progressRecords: [],
          summary: null
        }
      });
    }

    // Generate comprehensive report
    const summary = {
      totalCourses: progressRecords.length,
      completedCourses: progressRecords.filter(p => p.status === 'completed').length,
      inProgressCourses: progressRecords.filter(p => p.status === 'in-progress').length,
      totalTimeSpent: progressRecords.reduce((sum, p) => sum + p.totalTimeSpent, 0),
      averageProgress: Math.round(
        progressRecords.reduce((sum, p) => sum + p.overallProgress, 0) / progressRecords.length
      ),
      totalMilestones: progressRecords.reduce((sum, p) => sum + p.milestones.length, 0),
      averageQuizScore: Math.round(
        progressRecords.reduce((sum, p) => sum + p.performanceMetrics.averageQuizScore, 0) / progressRecords.length
      ),
      averageAssignmentScore: Math.round(
        progressRecords.reduce((sum, p) => sum + p.performanceMetrics.averageAssignmentScore, 0) / progressRecords.length
      ),
      overallEngagement: Math.round(
        progressRecords.reduce((sum, p) => sum + p.performanceMetrics.engagementScore, 0) / progressRecords.length
      ),
      longestStreak: Math.max(...progressRecords.map(p => p.performanceMetrics.longestStreak), 0),
      currentStreak: Math.max(...progressRecords.map(p => p.performanceMetrics.streakDays), 0)
    };

    // Recent activity across all courses
    const recentActivity = progressRecords
      .flatMap(p => p.activityLog.map(log => ({
        ...log.toObject(),
        courseTitle: p.courseId?.title,
        coursCategory: p.courseId?.category
      })))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 50);

    // Learning patterns
    const learningPatterns = {
      preferredLearningTimes: {}, // Could be enhanced with actual time analysis
      mostActiveDay: null,
      averageSessionLength: Math.round(
        progressRecords.reduce((sum, p) => sum + p.averageSessionTime, 0) / progressRecords.length
      ),
      studyConsistency: summary.currentStreak > 0 ? 'High' : summary.longestStreak > 7 ? 'Medium' : 'Low'
    };

    res.json({
      success: true,
      data: {
        student,
        summary,
        progressRecords,
        recentActivity,
        learningPatterns
      }
    });
  } catch (error) {
    console.error('Error generating student report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating student report',
      error: error.message
    });
  }
});

// Get course completion trends
router.get('/trends/completion', async (req, res) => {
  try {
    const { courseId, period = 'monthly' } = req.query;
    
    let query = {};
    if (courseId) query.courseId = courseId;

    const progressRecords = await StudentProgress.find(query)
      .populate('courseId', 'title category');

    // Group completions by time period
    const completionTrends = {};
    
    progressRecords.forEach(progress => {
      if (progress.completedAt) {
        const date = new Date(progress.completedAt);
        let periodKey;
        
        if (period === 'daily') {
          periodKey = date.toISOString().split('T')[0];
        } else if (period === 'weekly') {
          const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
          periodKey = weekStart.toISOString().split('T')[0];
        } else { // monthly
          periodKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        }
        
        if (!completionTrends[periodKey]) {
          completionTrends[periodKey] = {
            period: periodKey,
            completions: 0,
            courses: new Set()
          };
        }
        
        completionTrends[periodKey].completions++;
        completionTrends[periodKey].courses.add(progress.courseId?.title || 'Unknown');
      }
    });

    // Convert to array and add course count
    const trends = Object.values(completionTrends)
      .map(trend => ({
        ...trend,
        uniqueCourses: Array.from(trend.courses).length,
        courses: Array.from(trend.courses)
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    res.json({
      success: true,
      data: {
        trends,
        period,
        totalCompletions: trends.reduce((sum, t) => sum + t.completions, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching completion trends:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching completion trends',
      error: error.message
    });
  }
});

// Bulk update progress (for data migration or batch operations)
router.post('/bulk-update', async (req, res) => {
  try {
    const { updates } = req.body; // Array of progress updates
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates array is required and cannot be empty'
      });
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { studentId, courseId, ...progressData } = update;
        
        const progress = await StudentProgress.findOne({ studentId, courseId });
        if (progress) {
          Object.assign(progress, progressData);
          await progress.save();
          results.push({
            studentId,
            courseId,
            status: 'updated',
            newProgress: progress.overallProgress
          });
        } else {
          errors.push({
            studentId,
            courseId,
            error: 'Progress record not found'
          });
        }
      } catch (error) {
        errors.push({
          studentId: update.studentId,
          courseId: update.courseId,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk update completed. ${results.length} successful, ${errors.length} failed.`,
      data: {
        successful: results,
        failed: errors,
        summary: {
          total: updates.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });
  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing bulk update',
      error: error.message
    });
  }
});

module.exports = router;
 
// ===== STUDENT PROGRESS UPDATE ROUTES =====

// Update assignment progress for a student within a course/module
router.put('/student/:studentId/assignment', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { courseId, moduleId, assignmentId, assignmentTitle, status, score, maxScore = 100, timeSpent = 0, feedback } = req.body;

    if (!studentId || !courseId || !moduleId || !assignmentId || !assignmentTitle) {
      return res.status(400).json({ success: false, message: 'studentId, courseId, moduleId, assignmentId, assignmentTitle are required' });
    }

    const course = await resolveCourseId(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    let progress = await getOrCreateProgress(studentId, course);

    // Find or create module progress
    let moduleProg = progress.modules.find(m => m.moduleId === moduleId);
    if (!moduleProg) {
      progress.modules.push({
        moduleId,
        moduleTitle: moduleId,
        status: 'in-progress',
        lessons: [],
        assignments: [],
        quizzes: [],
        progressPercentage: 0,
        totalTimeSpent: 0
      });
      moduleProg = progress.modules.find(m => m.moduleId === moduleId);
    }

    // Find or create assignment entry
    let assignment = moduleProg.assignments.find(a => a.assignmentId === assignmentId);
    const now = new Date();
    if (!assignment) {
      moduleProg.assignments.push({
        assignmentId,
        assignmentTitle,
        status: status || 'submitted',
        startedAt: status === 'in-progress' ? now : null,
        submittedAt: status === 'submitted' || status === 'graded' ? now : null,
        gradedAt: status === 'graded' ? now : null,
        score: score ?? null,
        maxScore,
        attempts: [],
        feedback: feedback || null,
        timeSpent: timeSpent || 0
      });
      assignment = moduleProg.assignments.find(a => a.assignmentId === assignmentId);
    } else {
      // Update existing assignment
      if (status) assignment.status = status;
      if (status === 'submitted' || status === 'graded') assignment.submittedAt = now;
      if (status === 'graded') assignment.gradedAt = now;
      if (typeof score === 'number') assignment.score = score;
      if (typeof maxScore === 'number') assignment.maxScore = maxScore;
      if (typeof timeSpent === 'number') assignment.timeSpent = (assignment.timeSpent || 0) + timeSpent;
      if (feedback) assignment.feedback = feedback;
    }

    // Record attempt on submission/graded
    if (status === 'submitted' || status === 'graded') {
      const attemptNumber = (assignment.attempts?.length || 0) + 1;
      assignment.attempts.push({ attemptNumber, submittedAt: now, score: typeof score === 'number' ? score : undefined, feedback, timeSpent });
    }

    // Update module progress percentage
    const totalItems = (moduleProg.lessons?.length || 0) + (moduleProg.assignments?.length || 0) + (moduleProg.quizzes?.length || 0);
    const completedItems = (moduleProg.lessons?.filter(l => l.status === 'completed').length || 0)
      + (moduleProg.assignments?.filter(a => a.status === 'graded').length || 0)
      + (moduleProg.quizzes?.filter(q => q.status === 'completed').length || 0);
    moduleProg.progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : moduleProg.progressPercentage || 0;

    // Activity log
    progress.activityLog.push({ type: 'assignment_submitted', details: { moduleId, assignmentId, status, score }, timestamp: now });
    progress.lastActivityAt = now;

    // Update performance metrics and overall progress
    progress.updatePerformanceMetrics();
    progress.updateOverallProgress();

    await progress.save();

    return res.json({ success: true, message: 'Assignment progress updated', data: { overallProgress: progress.overallProgress } });
  } catch (error) {
    console.error('Error updating assignment progress:', error);
    return res.status(500).json({ success: false, message: 'Error updating assignment progress', error: error.message });
  }
});

// Update quiz progress for a student within a course/module
router.put('/student/:studentId/quiz', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { courseId, moduleId, quizId, quizTitle, status = 'completed', score, maxScore = 100, timeSpent = 0, answers = [] } = req.body;

    if (!studentId || !courseId || !moduleId || !quizId || !quizTitle) {
      return res.status(400).json({ success: false, message: 'studentId, courseId, moduleId, quizId, quizTitle are required' });
    }

    const course = await resolveCourseId(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    let progress = await getOrCreateProgress(studentId, course);

    // Find or create module progress
    let moduleProg = progress.modules.find(m => m.moduleId === moduleId);
    if (!moduleProg) {
      progress.modules.push({
        moduleId,
        moduleTitle: moduleId,
        status: 'in-progress',
        lessons: [],
        assignments: [],
        quizzes: [],
        progressPercentage: 0,
        totalTimeSpent: 0
      });
      moduleProg = progress.modules.find(m => m.moduleId === moduleId);
    }

    // Find or create quiz entry
    let quiz = moduleProg.quizzes.find(q => q.quizId === quizId);
    const now = new Date();
    if (!quiz) {
      moduleProg.quizzes.push({
        quizId,
        quizTitle,
        status,
        attempts: [],
        bestScore: typeof score === 'number' ? score : 0,
        totalAttempts: 0,
        averageScore: typeof score === 'number' ? score : 0
      });
      quiz = moduleProg.quizzes.find(q => q.quizId === quizId);
    } else {
      if (status) quiz.status = status;
    }

    // Add attempt
    const attemptNumber = (quiz.attempts?.length || 0) + 1;
    quiz.attempts.push({ attemptNumber, startedAt: now, completedAt: now, score, maxScore, timeSpent, answers });
    quiz.totalAttempts = attemptNumber;
    if (typeof score === 'number') {
      quiz.bestScore = Math.max(quiz.bestScore || 0, score);
      const totalScore = (quiz.averageScore || 0) * (attemptNumber - 1) + score;
      quiz.averageScore = Math.round(totalScore / attemptNumber);
    }

    // Update module progress percentage
    const totalItems = (moduleProg.lessons?.length || 0) + (moduleProg.assignments?.length || 0) + (moduleProg.quizzes?.length || 0);
    const completedItems = (moduleProg.lessons?.filter(l => l.status === 'completed').length || 0)
      + (moduleProg.assignments?.filter(a => a.status === 'graded').length || 0)
      + (moduleProg.quizzes?.filter(q => q.status === 'completed').length || 0);
    moduleProg.progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : moduleProg.progressPercentage || 0;

    // Activity log
    progress.activityLog.push({ type: 'quiz_taken', details: { moduleId, quizId, score }, timestamp: now });
    progress.lastActivityAt = now;

    // Update performance metrics and overall progress
    progress.updatePerformanceMetrics();
    progress.updateOverallProgress();

    await progress.save();

    return res.json({ success: true, message: 'Quiz progress updated', data: { overallProgress: progress.overallProgress } });
  } catch (error) {
    console.error('Error updating quiz progress:', error);
    return res.status(500).json({ success: false, message: 'Error updating quiz progress', error: error.message });
  }
});

// Get assignment/quiz summary counts for a student course
router.get('/student/:studentId/course/:courseId/summary', async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const course = await resolveCourseId(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const progress = await StudentProgress.findOne({ studentId, courseId: course._id });
    // Base counts from StudentProgress (if present)
    let assignmentTotal = 0;
    let assignmentCompleted = 0;
    let assignmentList = [];
    let quizTotal = 0;
    let quizCompleted = 0;
    let quizList = [];

    if (progress) {
      for (const mod of progress.modules || []) {
        // Assignments
        for (const a of mod.assignments || []) {
          assignmentTotal += 1;
          if (a.status === 'graded') assignmentCompleted += 1;
          assignmentList.push({ title: a.assignmentTitle, status: a.status, score: a.score });
        }
        // Quizzes
        for (const q of mod.quizzes || []) {
          quizTotal += 1;
          if (q.status === 'completed') quizCompleted += 1;
          quizList.push({ title: q.quizTitle, status: q.status, score: q.bestScore });
        }
      }
    }

    // Fallback aggregation from AssignmentAttempt + Assignment definitions
    // Useful when StudentProgress modules were not recorded by the client
    const courseKey = normalizeCourseKeyFromCourse(course);
    if (courseKey) {
      const idPrefixRegex = new RegExp(`^${escapeRegex(courseKey)}-`, 'i');

      // Load all assignments for the course by ID prefix
      const allAssignments = await Assignment.find({ assignmentId: idPrefixRegex }).lean();
      const attempts = await AssignmentAttempt.find({ studentId, assignmentId: idPrefixRegex }).sort({ createdAt: -1 }).lean();

      if (Array.isArray(allAssignments) && allAssignments.length > 0) {
        const bestByAssignment = new Map();
        for (const at of attempts) {
          const prev = bestByAssignment.get(at.assignmentId);
          if (!prev || (at.percentage || 0) > (prev.percentage || 0)) {
            bestByAssignment.set(at.assignmentId, at);
          }
        }

        const attemptedIds = new Set(attempts.map(a => a.assignmentId));
        const totalByDefs = allAssignments.length;
        const completedByAttempts = attemptedIds.size; // Treat any attempt as completion

        // Build list with status from best attempt per assignment
        const listFromAttempts = allAssignments.map(def => {
          const best = bestByAssignment.get(def.assignmentId);
          const status = best ? (best.passed ? 'passed' : 'attempted') : 'pending';
          const score = best ? best.percentage : 0;
          return { title: def.title || def.assignmentId, status, score };
        });

        // Prefer StudentProgress counts if they exist; otherwise use attempts-based
        if (assignmentTotal === 0 && assignmentList.length === 0) {
          assignmentTotal = totalByDefs;
          assignmentCompleted = completedByAttempts;
          assignmentList = listFromAttempts;
        } else {
          // Merge totals sensibly
          assignmentTotal = Math.max(assignmentTotal, totalByDefs);
          assignmentCompleted = Math.max(assignmentCompleted, completedByAttempts);
          if (assignmentList.length === 0) assignmentList = listFromAttempts;
        }
      }
    }

    return res.json({
      success: true,
      data: {
        assignments: { completed: assignmentCompleted, total: assignmentTotal, list: assignmentList },
        quizzes: { completed: quizCompleted, total: quizTotal, list: quizList }
      }
    });
  } catch (error) {
    console.error('Error fetching course summary:', error);
    return res.status(500).json({ success: false, message: 'Error fetching course summary', error: error.message });
  }
});

// Recompute strict completion status for all students in a course
router.post('/course/:courseId/recompute-status', async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await resolveCourseId(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const progressRecords = await StudentProgress.find({ courseId: course._id });
    const studentIds = progressRecords.map(p => p.studentId);
    const students = await Student.find({ _id: { $in: studentIds } }).select('enrolledCourses');
    const enrollmentsByStudent = new Map(
      students.map(s => [s._id.toString(), s.enrolledCourses || []])
    );

    let updated = 0;
    for (const p of progressRecords) {
      const assignmentsCompleted = (p.modules || []).reduce((sum, m) => sum + ((m.assignments || []).filter(a => a.status === 'graded').length), 0);
      const enrollments = enrollmentsByStudent.get(p.studentId.toString()) || [];
      const enrollment = enrollments.find(e => e.courseId?.toString() === course._id.toString());
      const projectsCompleted = enrollment?.completedModules?.length || 0;
      const meetsStrict = projectsCompleted >= 4 && assignmentsCompleted >= 6;

      // Derive status from current overallProgress and strict
      const originalStatus = p.status;
      if (p.overallProgress === 0) {
        p.status = 'not-started';
        p.completedAt = null;
      } else if (p.overallProgress === 100) {
        if (meetsStrict) {
          p.status = 'completed';
          if (!p.completedAt) p.completedAt = new Date();
        } else {
          p.status = 'in-progress';
          p.completedAt = null;
        }
      } else {
        p.status = 'in-progress';
        p.completedAt = null;
      }

      if (p.status !== originalStatus) {
        updated += 1;
      }
      await p.save();
    }

    return res.json({ success: true, message: 'Statuses recomputed', data: { total: progressRecords.length, updated } });
  } catch (error) {
    console.error('Error recomputing statuses:', error);
    return res.status(500).json({ success: false, message: 'Error recomputing statuses', error: error.message });
  }
});