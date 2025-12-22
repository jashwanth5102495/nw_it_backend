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

    // Guard: study-only assignments (no quiz)
    if (totalQuestions === 0) {
      return res.status(400).json({
        success: false,
        message: 'This assignment is study-only and has no quiz to submit.'
      });
    }

    let correctAnswers = 0;
    const detailedAnswers = [];
    
    // Fallback map for assignments missing correctAnswer (CSS Part 2; JavaScript Part 1 & 2)
    const fallbackCorrectAnswersMap = {
      'frontend-beginner-5': {
        '1': 1, '2': 1, '3': 2, '4': 1, '5': 1,
        '6': 2, '7': 2, '8': 0, '9': 2, '10': 2
      },
      // JavaScript Part 1: explicit indices from seed mapping
      'frontend-beginner-6': {
        '1': 0, '2': 1, '3': 2, '4': 2, '5': 1,
        '6': 3, '7': 1, '8': 1, '9': 2, '10': 2
      },
      // JavaScript Part 2: all correct options are the second item (index 1)
      'frontend-beginner-7': {
        '1': 1, '2': 1, '3': 1, '4': 1, '5': 1,
        '6': 1, '7': 1, '8': 1, '9': 1, '10': 1
      }
    };

    const fallbackCorrectAnswers = fallbackCorrectAnswersMap[assignment.assignmentId] || null;

    const debug = ['frontend-beginner-6', 'frontend-beginner-7'].includes(assignment.assignmentId);
    if (debug) {
      try {
        console.log('[Scoring Debug] Submit payload summary:', {
          assignmentId,
          totalQuestions,
          answersKeys: Object.keys(answers || {}),
          fallbackKeys: fallbackCorrectAnswers ? Object.keys(fallbackCorrectAnswers) : []
        });
      } catch (e) {
        console.warn('[Scoring Debug] Logging failed:', e?.message);
      }
    }

    assignment.questions.forEach(question => {
      const rawSelected = answers[question.questionId];
      const selectedAnswer = rawSelected !== undefined && rawSelected !== null
        ? Number(rawSelected)
        : undefined;

      const normalizedCorrect = typeof question.correctAnswer === 'number'
        ? question.correctAnswer
        : Number(question.correctAnswer);

      const hasValidCorrect = Number.isInteger(normalizedCorrect)
        && normalizedCorrect >= 0
        && Array.isArray(question.options)
        && normalizedCorrect < question.options.length;

      const fallback = fallbackCorrectAnswers
        ? fallbackCorrectAnswers[String(question.questionId)]
        : undefined;

      const finalCorrect = hasValidCorrect
        ? normalizedCorrect
        : (typeof fallback === 'number' ? fallback : undefined);

      const isCorrect = selectedAnswer !== undefined
        && finalCorrect !== undefined
        && selectedAnswer === finalCorrect;

      if (isCorrect) {
        correctAnswers++;
      }

      if (debug) {
        console.log('[Scoring Debug] Q', String(question.questionId), {
          selectedAnswer,
          finalCorrect,
          hasValidCorrect,
          fallback
        });
      }

      detailedAnswers.push({
        questionId: question.questionId,
        selectedAnswer: selectedAnswer !== undefined ? selectedAnswer : -1,
        isCorrect
      });
    });

    const percentage = (correctAnswers / totalQuestions) * 100;
    const strictPassIds = new Set(['networking-beginner-1', 'networking-beginner-2', 'networking-beginner-4']);
    const passed = strictPassIds.has(assignment.assignmentId)
      ? (percentage > assignment.passingPercentage)
      : (percentage >= assignment.passingPercentage);

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

    // --- Update StudentProgress with assignment completion on pass ---
    let progressUpdate = { updated: false };
    try {
      const Course = require('../models/Course');
      const StudentProgress = require('../models/StudentProgress');

      // Resolve course by string courseId on assignment
      const course = await Course.findOne({ courseId: assignment.courseId })
        || await Course.findOne({ courseId: new RegExp('^' + (assignment.courseId || '') + '$', 'i') });

      if (course) {
        let progress = await StudentProgress.findOne({ studentId: student._id, courseId: course._id });
        // Auto-initialize progress if missing
        if (!progress) {
          progress = new StudentProgress({
            studentId: student._id,
            courseId: course._id,
            enrollmentDate: new Date(),
            modules: course.modules.map((m, idx) => ({
              moduleId: `module_${idx + 1}`,
              moduleTitle: m.title,
              lessons: (m.topics || []).map((t, tIdx) => ({
                lessonId: `lesson_${idx + 1}_${tIdx + 1}`,
                lessonTitle: t
              })),
              assignments: [],
              quizzes: []
            }))
          });
        }

        // Heuristic: place HA/Bonding assignment under module with bonding/LACP topics
        const targetModule = progress.modules.find(m =>
          /bonding|lacp|routing, switching|vlan/i.test(m.moduleTitle)
        ) || progress.modules[progress.modules.length - 1] || progress.modules[0];

        if (targetModule) {
          let a = targetModule.assignments.find(x => x.assignmentId === assignment.assignmentId);
          if (!a) {
            a = {
              assignmentId: assignment.assignmentId,
              assignmentTitle: assignment.title,
              status: 'not-started',
              attempts: []
            };
            targetModule.assignments.push(a);
            a = targetModule.assignments[targetModule.assignments.length - 1];
          }

          // Append attempt
          a.attempts.push({
            attemptNumber: (a.attempts?.length || 0) + 1,
            submittedAt: new Date(),
            score: correctAnswers,
            timeSpent: timeSpent || 0
          });

          a.score = correctAnswers;
          a.maxScore = totalQuestions;
          a.submittedAt = a.submittedAt || new Date();

          // Mark completed when percentage >= passingPercentage (requested policy)
          if (passed) {
            a.status = 'graded';
            a.gradedAt = a.gradedAt || new Date();
            targetModule.status = targetModule.status === 'not-started' ? 'in-progress' : targetModule.status;
            progress.activityLog.push({
              type: 'assignment_submitted',
              details: { moduleId: targetModule.moduleId, assignmentId: a.assignmentId, score: a.score, maxScore: a.maxScore, passed: true }
            });
          } else {
            a.status = 'submitted';
            progress.activityLog.push({
              type: 'assignment_submitted',
              details: { moduleId: targetModule.moduleId, assignmentId: a.assignmentId, assignmentTitle: a.assignmentTitle, passed: false }
            });
          }

          progress.lastActivityAt = new Date();
          await progress.save();
          progressUpdate = { updated: true, moduleId: targetModule.moduleId };
        }
      }
    } catch (e) {
      console.warn('StudentProgress update skipped:', e?.message);
    }

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
        progressUpdate
      },
      message: passed
        ? 'Congratulations! You passed the assignment.'
        : `Keep learning! You need to score at least ${assignment.passingPercentage}% to pass.`
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
