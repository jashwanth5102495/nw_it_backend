const express = require('express');
const StudentProgress = require('../models/StudentProgress');
const Student = require('../models/Student');
const Course = require('../models/Course');
const router = express.Router();

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

    let query = { courseId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const progressRecords = await StudentProgress.find(query)
      .populate('studentId', 'firstName lastName email studentId')
      .populate('courseId', 'title courseId category level')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StudentProgress.countDocuments(query);

    // Calculate course statistics
    const allProgress = await StudentProgress.find({ courseId });
    const courseStats = {
      totalStudents: allProgress.length,
      completedStudents: allProgress.filter(p => p.status === 'completed').length,
      inProgressStudents: allProgress.filter(p => p.status === 'in-progress').length,
      averageProgress: Math.round(allProgress.reduce((sum, p) => sum + p.overallProgress, 0) / allProgress.length) || 0,
      averageTimeSpent: Math.round(allProgress.reduce((sum, p) => sum + p.totalTimeSpent, 0) / allProgress.length) || 0,
      averageEngagement: Math.round(allProgress.reduce((sum, p) => sum + p.performanceMetrics.engagementScore, 0) / allProgress.length) || 0
    };

    res.json({
      success: true,
      data: {
        progressRecords,
        courseStats,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course progress',
      error: error.message
    });
  }
});

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