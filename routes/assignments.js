const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const AssignmentAttempt = require('../models/AssignmentAttempt');
const Student = require('../models/Student');
const { authenticateStudent } = require('../middleware/auth');

/**
 * @route   GET /api/assignments/:assignmentId
 * @desc    Get assignment by ID (without answers for security)
 * @access  Private
 */
router.get('/:assignmentId', authenticateStudent, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const assignment = await Assignment.findOne({ assignmentId });
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    // Return assignment data without correct answers (for security)
    const assignmentData = {
      assignmentId: assignment.assignmentId,
      courseId: assignment.courseId,
      title: assignment.title,
      description: assignment.description,
      topics: assignment.topics,
      questions: assignment.questions.map(q => ({
        questionId: q.questionId,
        question: q.prompt || q.question, // Support both field names
        options: q.options
        // correctAnswer is intentionally omitted
      })),
      totalQuestions: assignment.questions.length,
      passingPercentage: assignment.passingPercentage
    };
    
    res.json({
      success: true,
      data: assignmentData
    });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignment',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/assignments/:assignmentId/submit
 * @desc    Submit assignment attempt and record score
 * @access  Private
 */
router.post('/:assignmentId/submit', authenticateStudent, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { answers, timeSpent } = req.body; // answers is object: { questionId: selectedAnswer }
    
    // Get student info from authenticated request
    const student = req.student?.studentData;
    const userEmail = student?.email;
    
    if (!student || !userEmail) {
      return res.status(401).json({
        success: false,
        message: 'Student authentication failed'
      });
    }
    
    // Validate input
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid answers format'
      });
    }
    
    // Get the assignment with correct answers
    const assignment = await Assignment.findOne({ assignmentId });
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Calculate score
    const totalQuestions = assignment.questions.length;
    let correctAnswers = 0;
    const detailedAnswers = [];
    
    assignment.questions.forEach(question => {
      const selectedAnswer = answers[question.questionId];
      const isCorrect = selectedAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctAnswers++;
      }
      
      detailedAnswers.push({
        questionId: question.questionId,
        selectedAnswer: selectedAnswer !== undefined ? selectedAnswer : -1,
        isCorrect
      });
    });
    
    const percentage = (correctAnswers / totalQuestions) * 100;
    const passed = percentage > assignment.passingPercentage;
    
    // Get attempt number (how many times has this student attempted this assignment)
    const previousAttempts = await AssignmentAttempt.countDocuments({
      studentEmail: userEmail,
      assignmentId
    });
    
    // Create assignment attempt record
    const attemptRecord = new AssignmentAttempt({
      studentId: student._id,
      studentEmail: userEmail,
      assignmentId,
      answers: detailedAnswers,
      score: correctAnswers,
      totalQuestions,
      percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
      passed,
      timeSpent: timeSpent || 0,
      attemptNumber: previousAttempts + 1
    });
    
    await attemptRecord.save();
    
    // Return result
    res.json({
      success: true,
      data: {
        attemptId: attemptRecord._id,
        score: correctAnswers,
        totalQuestions,
        percentage: attemptRecord.percentage,
        passed,
        attemptNumber: attemptRecord.attemptNumber,
        passingPercentage: assignment.passingPercentage,
        message: passed 
          ? '🎉 Congratulations! You passed the assignment!' 
          : '📚 Keep learning! You need to score more than 50% to pass.'
      }
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting assignment',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/assignments/:assignmentId/attempts
 * @desc    Get student's attempt history for an assignment
 * @access  Private
 */
router.get('/:assignmentId/attempts', authenticateStudent, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    // Get student info from authenticated request
    const student = req.student?.studentData;
    const userEmail = student?.email;
    
    if (!student || !userEmail) {
      return res.status(401).json({
        success: false,
        message: 'Student authentication failed'
      });
    }
    
    const attempts = await AssignmentAttempt.find({
      studentEmail: userEmail,
      assignmentId
    })
    .sort({ createdAt: -1 }) // Most recent first
    .select('-answers') // Don't send detailed answers in history
    .lean();
    
    // Get assignment info
    const assignment = await Assignment.findOne({ assignmentId })
      .select('title passingPercentage');
    
    res.json({
      success: true,
      data: {
        assignment: assignment ? {
          title: assignment.title,
          passingPercentage: assignment.passingPercentage
        } : null,
        attempts,
        totalAttempts: attempts.length,
        bestScore: attempts.length > 0 
          ? Math.max(...attempts.map(a => a.percentage)) 
          : 0,
        passed: attempts.some(a => a.passed)
      }
    });
  } catch (error) {
    console.error('Error fetching attempts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attempt history',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/assignments/:assignmentId/attempts/:attemptId
 * @desc    Get detailed results of a specific attempt
 * @access  Private
 */
router.get('/:assignmentId/attempts/:attemptId', authenticateStudent, async (req, res) => {
  try {
    const { assignmentId, attemptId } = req.params;
    
    // Get student info from authenticated request
    const student = req.student?.studentData;
    const userEmail = student?.email;
    
    if (!student || !userEmail) {
      return res.status(401).json({
        success: false,
        message: 'Student authentication failed'
      });
    }
    
    const attempt = await AssignmentAttempt.findOne({
      _id: attemptId,
      studentEmail: userEmail,
      assignmentId
    });
    
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }
    
    // Get assignment to show questions with answers
    const assignment = await Assignment.findOne({ assignmentId });
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    // Build detailed result
    const detailedResults = assignment.questions.map(question => {
      const answer = attempt.answers.find(a => a.questionId === question.questionId);
      
      return {
        questionId: question.questionId,
        question: question.prompt || question.question, // Support both field names
        options: question.options,
        correctAnswer: question.correctAnswer,
        selectedAnswer: answer ? answer.selectedAnswer : -1,
        isCorrect: answer ? answer.isCorrect : false
      };
    });
    
    res.json({
      success: true,
      data: {
        attempt: {
          attemptId: attempt._id,
          attemptNumber: attempt.attemptNumber,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          percentage: attempt.percentage,
          passed: attempt.passed,
          timeSpent: attempt.timeSpent,
          createdAt: attempt.createdAt
        },
        assignment: {
          title: assignment.title,
          passingPercentage: assignment.passingPercentage
        },
        detailedResults
      }
    });
  } catch (error) {
    console.error('Error fetching attempt details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attempt details',
      error: error.message
    });
  }
});

module.exports = router;
