/**
 * Exam Grading Utility with Partial Credit System
 * 
 * Grading Philosophy (mimics real PF lab grading):
 * - Empty submission: 0%
 * - Pseudocode/comments only: 15%
 * - Code written but doesn't compile: 20%
 * - Compiles but no test cases pass: 25-30%
 * - Partial test cases pass: 30-90%
 * - All test cases pass: 100%
 */

import { executeCode } from './api';

/**
 * Main grading function for an entire exam attempt
 */
export async function gradeExamSubmissions(supabase, attemptId) {
    console.log('🎓 Starting exam grading for attempt:', attemptId);

    // Get attempt details including user_id
    const { data: attempt, error: attemptError } = await supabase
        .from('exam_attempts')
        .select('id, user_id, exam_id')
        .eq('id', attemptId)
        .single();

    if (attemptError || !attempt) {
        console.error('Error fetching attempt:', attemptError);
        throw attemptError;
    }

    // Get all submissions for this attempt
    const { data: submissions, error } = await supabase
        .from('exam_submissions')
        .select(`
            id,
            code,
            question_id,
            exam_questions (
                id,
                marks,
                visible_test_cases,
                hidden_test_cases
            )
        `)
        .eq('attempt_id', attemptId);

    if (error) {
        console.error('Error fetching submissions:', error);
        throw error;
    }

    let totalScore = 0;
    const gradingResults = [];

    // Grade each question
    for (const submission of submissions) {
        const result = await gradeQuestion(submission);
        totalScore += result.score;
        gradingResults.push(result);

        // Update submission score
        await supabase
            .from('exam_submissions')
            .update({
                score: result.score,
                grading_details: result.breakdown
            })
            .eq('id', submission.id);

        console.log(`✅ Question ${submission.question_id}: ${result.score}/${result.maxMarks} marks`);
    }

    const finalScore = Math.round(totalScore);

    // Update attempt with final score
    await supabase
        .from('exam_attempts')
        .update({
            score: finalScore,
            status: 'graded'
        })
        .eq('id', attemptId);

    // Update user profile stats
    await updateUserExamStats(supabase, attempt.user_id, finalScore);

    console.log(`🏆 Total Score: ${finalScore}`);
    return {
        totalScore: finalScore,
        results: gradingResults
    };
}

/**
 * Update user's exam statistics in their profile
 */
async function updateUserExamStats(supabase, userId, newScore) {
    console.log('📊 Updating user stats for:', userId);

    // Get current stats
    const { data: profile } = await supabase
        .from('profiles')
        .select('exam_score, exam_attempts, best_exam_score')
        .eq('id', userId)
        .single();

    if (!profile) {
        console.error('Profile not found for user:', userId);
        return;
    }

    const currentExamScore = profile.exam_score || 0;
    const currentAttempts = profile.exam_attempts || 0;
    const currentBest = profile.best_exam_score || 0;

    // Calculate new stats
    const newExamScore = currentExamScore + newScore;
    const newAttempts = currentAttempts + 1;
    const newBest = Math.max(currentBest, newScore);

    // Update profile
    const { error } = await supabase
        .from('profiles')
        .update({
            exam_score: newExamScore,
            exam_attempts: newAttempts,
            best_exam_score: newBest
        })
        .eq('id', userId);

    if (error) {
        console.error('Error updating user stats:', error);
    } else {
        console.log(`✅ Updated stats: Total=${newExamScore}, Attempts=${newAttempts}, Best=${newBest}`);
    }
}

/**
 * Grade a single question with partial credit
 */
async function gradeQuestion(submission) {
    const { code, exam_questions: question } = submission;
    const maxMarks = question.marks;
    const starterCode = question.starter_code || '';

    // Step 0: Check if code is unchanged from starter code
    const isUnchanged = isCodeUnchanged(code, starterCode);
    if (isUnchanged) {
        return {
            score: 0,
            maxMarks,
            breakdown: {
                effort: 0,
                compilation: 0,
                testCases: 0,
                reason: 'No changes made to starter code'
            }
        };
    }

    // Step 1: Analyze code quality and effort
    const codeAnalysis = analyzeCodeQuality(code, starterCode);

    // Step 2: If no meaningful code, give participation marks
    if (codeAnalysis.isEmpty) {
        return {
            score: 0,
            maxMarks,
            breakdown: {
                effort: 0,
                compilation: 0,
                testCases: 0,
                reason: 'Empty submission'
            }
        };
    }

    if (codeAnalysis.isPseudocodeOnly) {
        return {
            score: maxMarks * 0.15, // 15% for pseudocode/comments
            maxMarks,
            breakdown: {
                effort: maxMarks * 0.15,
                compilation: 0,
                testCases: 0,
                reason: 'Pseudocode/comments only'
            }
        };
    }

    // Step 3: Check if code compiles
    const compilationResult = await checkCompilation(code);

    if (!compilationResult.compiles) {
        // Code written but doesn't compile: 20% base + effort bonus
        const effortBonus = Math.min(codeAnalysis.linesOfCode / 20, 5) * (maxMarks * 0.01);
        const score = (maxMarks * 0.20) + effortBonus;

        return {
            score: Math.min(score, maxMarks * 0.25), // Cap at 25%
            maxMarks,
            breakdown: {
                effort: maxMarks * 0.20,
                effortBonus,
                compilation: 0,
                testCases: 0,
                reason: 'Code does not compile'
            }
        };
    }

    // Step 4: Run test cases
    const allTests = [
        ...(question.visible_test_cases || []),
        ...(question.hidden_test_cases || [])
    ];

    let passedTests = 0;
    const testResults = [];

    for (const testCase of allTests) {
        try {
            const result = await executeCode(code, testCase.input);
            const expected = normalizeOutput(testCase.output);
            const actual = normalizeOutput(result.run?.output || '');
            const passed = expected === actual;

            if (passed) passedTests++;
            testResults.push({ passed, expected, actual });
        } catch (err) {
            testResults.push({ passed: false, error: err.message });
        }
    }

    // Step 5: Calculate final score
    const passRate = passedTests / allTests.length;

    let score;
    if (passRate === 0) {
        // Compiles but no tests pass: 25-30% base + effort bonus
        const baseScore = maxMarks * 0.25;
        const effortBonus = Math.min(codeAnalysis.linesOfCode / 15, 5) * (maxMarks * 0.01);
        score = baseScore + effortBonus;
        score = Math.min(score, maxMarks * 0.30); // Cap at 30%
    } else {
        // Test cases pass: scale from 30% to 100%
        // Formula: 30% + (passRate × 70%)
        score = (maxMarks * 0.30) + (passRate * maxMarks * 0.70);
    }

    return {
        score: Math.round(score),
        maxMarks,
        breakdown: {
            effort: maxMarks * 0.25,
            compilation: maxMarks * 0.05,
            testCases: passRate * maxMarks * 0.70,
            passedTests,
            totalTests: allTests.length,
            reason: `${passedTests}/${allTests.length} test cases passed`
        }
    };
}

/**
 * Check if submitted code is essentially unchanged from starter code
 */
function isCodeUnchanged(submittedCode, starterCode) {
    if (!starterCode || !submittedCode) return false;

    // Normalize both codes: remove comments, whitespace, and newlines
    const normalize = (code) => {
        return code
            .replace(/\/\*[\s\S]*?\*\//g, '') // Block comments
            .replace(/\/\/.*/g, '')              // Line comments
            .replace(/\s+/g, '')                 // All whitespace
            .replace(/\\n/g, '')                 // Escaped newlines
            .trim();
    };

    const normalizedSubmitted = normalize(submittedCode);
    const normalizedStarter = normalize(starterCode);

    // If they're identical or submitted is empty, code is unchanged
    return normalizedSubmitted === normalizedStarter || normalizedSubmitted.length === 0;
}

/**
 * Analyze code quality and effort
 */
function analyzeCodeQuality(code, starterCode = '') {
    if (!code || code.trim().length === 0) {
        return { isEmpty: true };
    }

    // Remove comments and whitespace for analysis
    const codeWithoutComments = code
        .replace(/\/\*[\s\S]*?\*\//g, '') // Block comments
        .replace(/\/\/.*/g, ''); // Line comments

    const meaningfulCode = codeWithoutComments
        .replace(/^\s*[\r\n]/gm, '') // Empty lines
        .trim();

    // Check if only comments/pseudocode
    if (meaningfulCode.length < 20) {
        return {
            isPseudocodeOnly: true,
            linesOfCode: 0
        };
    }

    // Count lines of actual code
    const lines = meaningfulCode.split('\n');
    const linesOfCode = lines.filter(line =>
        line.trim().length > 0 &&
        !line.trim().startsWith('//')
    ).length;

    // Detect common C++ patterns (indicates real attempt)
    const hasFunctions = /\w+\s+\w+\s*\([^)]*\)\s*{/.test(code);
    const hasLoops = /(for|while)\s*\(/.test(code);
    const hasConditions = /if\s*\(/.test(code);
    const hasArrays = /\w+\s*\[[^\]]*\]/.test(code);

    return {
        isEmpty: false,
        isPseudocodeOnly: false,
        linesOfCode,
        hasFunctions,
        hasLoops,
        hasConditions,
        hasArrays,
        complexityScore: [hasFunctions, hasLoops, hasConditions, hasArrays].filter(Boolean).length
    };
}

/**
 * Check if code compiles (quick syntax check)
 */
async function checkCompilation(code) {
    try {
        // Try to execute with empty input just to check compilation
        const result = await executeCode(code, '');

        // Check for compilation errors
        if (result.compile?.stderr) {
            return {
                compiles: false,
                error: result.compile.stderr
            };
        }

        return { compiles: true };
    } catch (error) {
        return {
            compiles: false,
            error: error.message
        };
    }
}

/**
 * Normalize output for comparison
 */
function normalizeOutput(output) {
    if (!output) return '';

    return output
        .trim()
        .replace(/\r\n/g, '\n')
        .replace(/\s+$/gm, '')
        .toLowerCase();
}

/**
 * Format grading result for display
 */
export function formatGradingResult(result) {
    const { score, maxMarks, breakdown } = result;
    const percentage = ((score / maxMarks) * 100).toFixed(1);

    return {
        score: `${Math.round(score)}/${maxMarks}`,
        percentage: `${percentage}%`,
        breakdown: breakdown.reason,
        details: breakdown
    };
}
