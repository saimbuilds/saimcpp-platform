// ========================================
// SaimCPP - Full Stack with Supabase
// ========================================

import supabaseClient from './lib/supabase.js';
import ProblemLoader from './lib/problemLoader.js';

// Application State
let currentUser = null;
let userProfile = null;
let monacoEditor = null;
let currentProblem = null;
let problemLoader = new ProblemLoader();
let allProblems = [];
let userFavorites = [];
let allUsers = [];

// Dry Run State
let allDryRunProblems = [];
let currentDryRun = null;
let hasViewedExplanation = false;
let dryRunMonacoEditor = null; // Monaco editor for dry run code display

// Submission locks to prevent race conditions
let isSubmitting = false;
let isDryRunSubmitting = false;

// Track solved problems (cached in localStorage)
let solvedProblems = new Set();
let solvedDryRuns = new Set();

// Filter state
let currentDifficultyFilter = 'all';
let currentStatusFilter = 'all';
let currentDryRunDifficultyFilter = 'all';
let currentDryRunStatusFilter = 'all';

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    // Load problems first
    allProblems = await problemLoader.loadAll();

    // Load dry run problems
    await loadDryRunProblems();

    checkAuth();
    setupEventListeners();
});

async function checkAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
        currentUser = session.user;
        await loadUserProfile();
    } else {
        showLoginScreen();
    }
}

async function loadUserProfile() {

    const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();


    if (error) {
        showProfileCompletion();
    } else if (!data) {
        // First time user - show profile completion
        showProfileCompletion();
    } else {
        userProfile = data;
        showDashboard();
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // Google Sign In
    document.getElementById('googleSignInBtn')?.addEventListener('click', signInWithGoogle);

    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.target.dataset.view;
            switchView(view);
            if (view === 'profile') {
                renderProfile();
            }
        });
    });

    // Back to problems
    document.getElementById('backToProblems')?.addEventListener('click', () => {
        showScreen('dashboardScreen');
        switchView('problems');
    });

    // Code editor actions
    document.getElementById('runCodeBtn')?.addEventListener('click', runCode);
    document.getElementById('submitCodeBtn')?.addEventListener('click', submitCode);
    document.getElementById('copyCodeBtn')?.addEventListener('click', copyCode);
    document.getElementById('clearOutput')?.addEventListener('click', clearOutput);

    // Problem filters
    document.getElementById('categoryFilter')?.addEventListener('change', renderProblems);
    document.getElementById('favoritesOnly')?.addEventListener('change', renderProblems);

    // Difficulty filter buttons for Problems
    document.querySelectorAll('.difficulty-filter').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.difficulty-filter').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentDifficultyFilter = e.target.dataset.difficulty;
            renderProblems();
        });
    });

    // Status filter buttons for Problems
    document.querySelectorAll('.status-filter').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.status-filter').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentStatusFilter = e.target.dataset.status;
            renderProblems();
        });
    });

    // Difficulty filter buttons for Dry Runs
    document.querySelectorAll('.dryrun-difficulty-filter').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.dryrun-difficulty-filter').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentDryRunDifficultyFilter = e.target.dataset.difficulty;
            renderDryRunProblems();
        });
    });

    // Status filter buttons for Dry Runs
    document.querySelectorAll('.dryrun-status-filter').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.dryrun-status-filter').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentDryRunStatusFilter = e.target.dataset.status;
            renderDryRunProblems();
        });
    });

    // Dry Run event listeners
    const backBtn = document.getElementById('backToDryRun');
    const submitBtn = document.getElementById('submitDryRunBtn');
    const viewBtn = document.getElementById('viewExplanationBtn');
    const clearBtn = document.getElementById('clearDryRunOutput');


    backBtn?.addEventListener('click', () => {
        showScreen('dashboardScreen');
        switchView('dryrun');
    });
    submitBtn?.addEventListener('click', () => {
        submitDryRunAnswer();
    });
    viewBtn?.addEventListener('click', () => {
        viewDryRunExplanation();
    });
    clearBtn?.addEventListener('click', () => {
        clearDryRunOutput();
    });
}

// ========================================
// AUTHENTICATION
// ========================================

async function signInWithGoogle() {
    const btn = document.getElementById('googleSignInBtn');
    const originalHTML = btn.innerHTML;

    // Show loading state
    btn.disabled = true;
    btn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" style="margin-right: 12px; animation: spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75"/>
        </svg>
        Signing in...
    `;

    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin
        }
    });

    if (error) {
        // Restore button on error
        btn.disabled = false;
        btn.innerHTML = originalHTML;
        alert('Sign in failed: ' + error.message);
    }
    // Note: On success, user will be redirected, so no need to restore button
}

async function handleLogout() {
    await supabaseClient.auth.signOut();
    currentUser = null;
    userProfile = null;
    // Reload page to clear everything
    window.location.reload();
}

// ========================================
// PROFILE COMPLETION
// ========================================

function showProfileCompletion() {
    const html = `
    <div class="modal-overlay active">
      <div class="modal">
        <div class="modal-header">
          <h2>Complete Your Profile</h2>
        </div>
        <div class="modal-body">
          <p style="margin-bottom: 2rem; color: var(--text-secondary);">
            Welcome to CodeGrind Arena! Please tell us about yourself:
          </p>
          
          <div class="input-group">
            <label class="input-label">Batch</label>
            <select id="batchSelect" class="select-field">
              <option value="">Select your batch</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>
          
          <div class="input-group">
            <label class="input-label">Department</label>
            <select id="departmentSelect" class="select-field">
              <option value="">Select your department</option>
              <option value="CS">Computer Science (CS)</option>
              <option value="DS">Data Science (DS)</option>
              <option value="AI">Artificial Intelligence (AI)</option>
              <option value="CY">Cyber Security (CY)</option>
              <option value="SE">Software Engineering (SE)</option>
            </select>
          </div>
          
          <button class="btn-primary btn-large" id="completeProfileBtn" style="margin-top: 2rem;">
            Complete Profile
          </button>
        </div>
      </div>
    </div>
  `;

    document.body.insertAdjacentHTML('beforeend', html);

    document.getElementById('completeProfileBtn').addEventListener('click', async () => {
        const batch = document.getElementById('batchSelect').value;
        const department = document.getElementById('departmentSelect').value;

        if (!batch || !department) {
            alert('Please select both batch and department');
            return;
        }

        const { data, error } = await supabaseClient
            .from('profiles')
            .insert({
                id: currentUser.id,
                email: currentUser.email,
                full_name: currentUser.user_metadata.full_name || 'User',
                avatar_url: currentUser.user_metadata.avatar_url,
                batch,
                department
            })
            .select()
            .single();

        if (error) {
            alert('Error creating profile: ' + error.message);
        } else {
            userProfile = data;
            document.querySelector('.modal-overlay').remove();
            showDashboard();
        }
    });
}

// ========================================
// SCREEN MANAGEMENT
// ========================================

function showLoginScreen() {
    showScreen('loginScreen');
}

function showDashboard() {
    showScreen('dashboardScreen');

    // Scroll to top multiple times to ensure it works
    setTimeout(() => {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }, 0);

    setTimeout(() => {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }, 100);

    updateHeader();

    // Load favorites
    loadFavorites().then(() => {
        renderProblems();
    });

    // These might fail if no data yet, don't let them break the UI
    try {
        renderLeaderboard();
    } catch (e) {
    }

    try {
        renderProfile();
    } catch (e) {
    }
}

function showScreen(screenId) {

    // Show/hide the app container based on screen
    const appContainer = document.getElementById('app');
    if (appContainer) {
        if (screenId === 'loginScreen') {
            // Show app container for login screen
            appContainer.style.display = 'block';
            appContainer.style.height = 'auto';
            appContainer.style.overflow = 'visible';
        } else {
            // Hide app container for other screens
            appContainer.style.display = 'none';
            appContainer.style.height = '0';
            appContainer.style.overflow = 'hidden';
        }
    }

    // Completely hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
        screen.style.display = 'none';
        screen.style.visibility = 'hidden';
        screen.style.height = '0';
        screen.style.overflow = 'hidden';
        screen.style.position = 'absolute';
        screen.style.top = '-99999px';
    });

    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        targetScreen.style.display = 'block';
        targetScreen.style.visibility = 'visible';
        targetScreen.style.height = 'auto';
        targetScreen.style.overflow = 'visible';
        targetScreen.style.opacity = '1';
        targetScreen.style.zIndex = '9999';
        targetScreen.style.position = 'static';
        targetScreen.style.top = '0';
    } else {
    }

    // Force scroll to top
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

function switchView(viewName) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewName}View`).classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === viewName) {
            btn.classList.add('active');
        }
    });

    // Handle dry run view
    if (viewName === 'dryrun') {
        renderDryRunProblems();
    }
}

// ========================================
// UI UPDATES
// ========================================

function updateHeader() {
    document.getElementById('usernameDisplay').textContent = userProfile.full_name || 'User';
    document.getElementById('streakDisplay').textContent = userProfile.current_streak || 0;
    document.getElementById('scoreDisplay').textContent = userProfile.total_score || 0;
}

// ========================================
// PROBLEMS VIEW
// ========================================

async function renderProblems() {
    const container = document.getElementById('problemsGrid');
    const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
    const favoritesOnly = document.getElementById('favoritesOnly')?.checked || false;

    let filtered = allProblems;

    // Filter by category
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(p => p.category.includes(categoryFilter));
    }

    // Filter by difficulty (using state variable)
    if (currentDifficultyFilter !== 'all') {
        filtered = filtered.filter(p => p.difficulty === currentDifficultyFilter);
    }

    // Filter by favorites
    if (favoritesOnly) {
        filtered = filtered.filter(p => userFavorites.includes(p.id));
    }

    // Get solved problems - convert problem_id to integer for comparison with local problem IDs
    const { data: solvedProblemsData } = await supabaseClient
        .from('submissions')
        .select('problem_id')
        .eq('user_id', userProfile.id)
        .eq('status', 'accepted');

    const solvedIds = new Set(solvedProblemsData?.map(s => parseInt(s.problem_id)) || []);

    // Filter by solved/unsolved status
    if (currentStatusFilter === 'solved') {
        filtered = filtered.filter(p => solvedIds.has(p.id));
    } else if (currentStatusFilter === 'unsolved') {
        filtered = filtered.filter(p => !solvedIds.has(p.id));
    }

    container.innerHTML = filtered.map(problem => {
        const isFavorite = userFavorites.includes(problem.id);
        const isSolved = solvedIds.has(problem.id);
        return `
      <div class="problem-card ${isSolved ? 'solved' : ''}" onclick="openProblem(${problem.id})">
        <div class="problem-card-header">
          <div class="problem-card-title">
            <h3>${isSolved ? '✅ ' : ''}${problem.title}</h3>
            <span class="difficulty-badge ${problem.difficulty}">${problem.difficulty}</span>
          </div>
          <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite(${problem.id})">
            ⭐
          </button>
        </div>
        <p>${problem.description.substring(0, 100)}...</p>
        <div class="problem-meta">
          <span>${problem.points} pts</span>
          <span>${problem.category}</span>
          ${isSolved ? '<span style="color: var(--easy); font-weight: 600;">● Solved</span>' : '<span style="color: var(--text-muted);">○ Unsolved</span>'}
        </div>
      </div>
    `;
    }).join('');
}

// ========================================
// CODE EDITOR
// ========================================

async function openProblem(problemId) {
    currentProblem = allProblems.find(p => p.id === problemId);
    if (!currentProblem) return;

    document.getElementById('problemTitle').textContent = currentProblem.title;
    document.getElementById('problemDifficulty').textContent = currentProblem.difficulty;
    document.getElementById('problemDifficulty').className = `difficulty-badge ${currentProblem.difficulty}`;
    document.getElementById('problemDescription').textContent = currentProblem.description;
    document.getElementById('problemInput').textContent = currentProblem.inputFormat;
    document.getElementById('problemOutput').textContent = currentProblem.outputFormat;

    // Show first sample test case
    const sampleTest = currentProblem.sampleTestCases?.[0] || currentProblem.testCases?.[0];
    const cleanInput = (sampleTest?.input || '').replace(/\\n/g, '\n');
    const cleanOutput = (sampleTest?.expectedOutput || sampleTest?.output || '').replace(/\\n/g, '\n');
    document.getElementById('sampleInput').textContent = cleanInput;
    document.getElementById('sampleOutput').textContent = cleanOutput;

    // Load saved code from localStorage or use starter code
    const savedCode = localStorage.getItem(`problem_${problemId}_code`);
    const codeToUse = savedCode || currentProblem.starterCode;

    if (!monacoEditor) {
        initMonacoEditor(codeToUse);
    } else {
        monacoEditor.setValue(codeToUse);
    }

    // Save code to localStorage on change (only if editor exists)
    if (monacoEditor && monacoEditor.onDidChangeModelContent) {
        monacoEditor.onDidChangeModelContent(() => {
            localStorage.setItem(`problem_${problemId}_code`, monacoEditor.getValue());
        });
    }

    // Check if problem is already solved and show/hide submit button accordingly
    await checkIfProblemSolved(problemId);

    showScreen('editorScreen');
    clearOutput();
}

async function checkIfProblemSolved(problemId) {

    // Load solved problems from localStorage
    const solved = JSON.parse(localStorage.getItem('solvedProblems') || '[]');
    solvedProblems = new Set(solved);

    const submitBtn = document.getElementById('submitCodeBtn');
    if (solvedProblems.has(problemId)) {
        // Already solved - hide submit button
        if (submitBtn) {
            submitBtn.style.display = 'none';
        }
        return true;
    } else {
        // Not solved - show submit button
        if (submitBtn) {
            submitBtn.style.display = 'inline-block';
        }
        return false;
    }
}

function markProblemAsSolved(problemId) {
    solvedProblems.add(problemId);
    localStorage.setItem('solvedProblems', JSON.stringify([...solvedProblems]));

    // Refresh the problem list to update UI
    renderProblems();
}

function initMonacoEditor(initialCode) {
    require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });

    require(['vs/editor/editor.main'], function () {
        monacoEditor = monaco.editor.create(document.getElementById('codeEditor'), {
            value: initialCode,
            language: 'cpp',
            theme: 'vs-dark',
            fontSize: 18, // Increased for better readability
            minimap: { enabled: false },
            automaticLayout: true,
            wordWrap: 'on',
            lineNumbers: 'on'
        });
    });
}

// ========================================
// CODE EXECUTION
// ========================================

function copyCode() {
    if (monacoEditor) {
        const code = monacoEditor.getValue();
        navigator.clipboard.writeText(code).then(() => {
            // Show brief success message
            const btn = document.getElementById('copyCodeBtn');
            const originalText = btn.textContent;
            btn.textContent = '✓ Copied!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        }).catch(err => {
            alert('Failed to copy code to clipboard');
        });
    }
}

async function runCode() {
    const code = monacoEditor.getValue();

    // Use sampleTestCases if available, otherwise use testCases
    const testCases = currentProblem.sampleTestCases || currentProblem.testCases || [];
    if (testCases.length === 0) {
        displayOutput('No test cases available', 'error');
        return;
    }

    const testCase = testCases[0];
    displayOutput('Running...');

    try {
        // Input is already clean from problemLoader
        const cleanInput = testCase.input || '';
        const result = await executeCode(code, cleanInput);

        if (result.error) {
            displayOutput(`Error:\n${result.error}`, 'error');
        } else {
            const output = result.output.trim();
            const expected = (testCase.expectedOutput || testCase.output || '').trim();

            if (output === expected) {
                displayOutput(`Success!\n\nOutput:\n${output}`, 'success');
            } else {
                displayOutput(`Wrong Answer\n\nYour Output:\n${output}\n\nExpected:\n${expected}`, 'error');
            }
        }
    } catch (error) {
        displayOutput(`Error:\n${error.message}`, 'error');
    }
}

async function submitCode() {
    // Prevent multiple simultaneous submissions
    if (isSubmitting) {
        return;
    }

    isSubmitting = true;
    const submitBtn = document.getElementById('submitCodeBtn');
    const code = monacoEditor.getValue();

    // Disable button to prevent multiple clicks
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    displayOutput('Running all test cases...');

    // Check if user already solved this problem FIRST
    const { data: previousSubmissions } = await supabaseClient
        .from('submissions')
        .select('status')
        .eq('user_id', userProfile.id)
        .eq('problem_id', currentProblem.id)
        .eq('status', 'accepted')
        .limit(1);

    const alreadySolved = previousSubmissions && previousSubmissions.length > 0;

    let passed = 0;
    let failed = 0;

    // Use both sample and hidden test cases
    const allTestCases = [
        ...(currentProblem.sampleTestCases || []),
        ...(currentProblem.hiddenTestCases || [])
    ];

    if (allTestCases.length === 0) {
        displayOutput('No test cases available', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Code';
        isSubmitting = false;
        return;
    }

    for (let testCase of allTestCases) {
        try {
            // Input is already clean from problemLoader
            const cleanInput = testCase.input || '';
            const result = await executeCode(code, cleanInput);
            const expected = (testCase.expectedOutput || testCase.output || '').trim();

            if (!result.error && result.output.trim() === expected) {
                passed++;
            } else {
                failed++;
            }
        } catch {
            failed++;
        }
    }

    const total = allTestCases.length;
    const status = failed === 0 ? 'accepted' : 'wrong';

    // Save to Supabase
    await saveSubmission(code, status, passed, total);

    const resultMessage = `${failed === 0 ? 'All Tests Passed!' : 'Some Failed'}\n\nPassed: ${passed}/${total}`;
    displayOutput(resultMessage, failed === 0 ? 'success' : 'error');

    if (status === 'accepted') {
        if (alreadySolved) {
            // Already solved - no points, hide submit button
            submitBtn.style.display = 'none';
        } else {
            // First time solving - award points, mark as solved, and hide submit button
            await updateUserScore(currentProblem.points);
            markProblemAsSolved(currentProblem.id); // Cache in localStorage
            showSuccessModal(currentProblem.points, false); // Show motivational popup
            submitBtn.style.display = 'none';
        }
    }

    // Re-enable button and unlock (only if still visible)
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Code';
    isSubmitting = false;
}

async function executeCode(code, input) {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            language: 'c++',
            version: '10.2.0',
            files: [{ name: 'main.cpp', content: code }],
            stdin: input
        })
    });

    const data = await response.json();

    if (data.compile?.code !== 0) {
        return { error: data.compile.output };
    }

    return { output: data.run.output || '' };
}

async function saveSubmission(code, status, passed, total) {
    await supabaseClient.from('submissions').insert({
        user_id: userProfile.id,
        problem_id: String(currentProblem.id), // Convert to string to match database text type
        code,
        status,
        test_cases_passed: passed,
        test_cases_total: total,
        points_earned: status === 'accepted' ? currentProblem.points : 0
    });
}

async function updateUserScore(points, incrementProblemsSolved = true) {
    if (!userProfile) return;

    const newScore = userProfile.total_score + points;
    const newProblemsSolved = incrementProblemsSolved ? userProfile.problems_solved + 1 : userProfile.problems_solved;

    // Calculate streak
    const today = new Date().toDateString();
    const lastSolvedDate = userProfile.last_solve_date ? new Date(userProfile.last_solve_date).toDateString() : null;
    const yesterday = new Date(Date.now() - 86400000).toDateString(); // 24 hours ago

    let newStreak = userProfile.current_streak || 0;

    if (lastSolvedDate === today) {
        // Already solved today, keep streak
        newStreak = userProfile.current_streak || 1;
    } else if (lastSolvedDate === yesterday) {
        // Solved yesterday, increment streak
        newStreak = (userProfile.current_streak || 0) + 1;
    } else if (!lastSolvedDate) {
        // First time solving
        newStreak = 1;
    } else {
        // Streak broken, reset to 1
        newStreak = 1;
    }

    // Update in Supabase
    const { error } = await supabaseClient
        .from('profiles')
        .update({
            total_score: newScore,
            problems_solved: newProblemsSolved,
            current_streak: newStreak,
            last_solve_date: new Date().toISOString()
        })
        .eq('id', userProfile.id);

    if (error) {
        console.error('Error updating score:', error);
        return;
    }

    // Update local state
    userProfile.total_score = newScore;
    userProfile.problems_solved = newProblemsSolved;
    userProfile.current_streak = newStreak;
    userProfile.last_solve_date = new Date().toISOString();

    // Update UI
    document.getElementById('scoreDisplay').textContent = newScore;
    document.getElementById('streakDisplay').textContent = newStreak;
}
function displayOutput(text, type = '') {
    document.getElementById('output').innerHTML = `<pre class="output-${type}">${text}</pre>`;
}

function clearOutput() {
    document.getElementById('output').innerHTML = '<p class="output-placeholder">Run your code to see output here...</p>';
}

// ========================================
// LEADERBOARD
// ========================================

async function renderLeaderboard() {
    const { data: users } = await supabaseClient
        .from('profiles')
        .select('*')
        .order('total_score', { ascending: false })
        .limit(10);

    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = users.map((user, index) => {
        const rank = index + 1;
        const medal = rank === 1 ? '#1' : rank === 2 ? '#2' : rank === 3 ? '#3' : rank;
        return `
      <tr style="${user.id === userProfile.id ? 'background: var(--bg-hover); font-weight: 600;' : ''}">
        <td class="rank-cell">${typeof medal === 'string' ? `<span class="rank-medal">${medal}</span>` : medal}</td>
        <td>${user.full_name}${user.id === userProfile.id ? ' (You)' : ''}</td>
        <td>${user.total_score}</td>
        <td>${user.problems_solved}</td>
        <td>${user.current_streak || 0}</td>
      </tr>
    `;
    }).join('');
}

// ========================================
// PROFILE
// ========================================

async function renderProfile() {
    document.getElementById('profileUsername').textContent = userProfile.full_name;
    document.getElementById('profileSolved').textContent = userProfile.problems_solved || 0;
    document.getElementById('profileScore').textContent = userProfile.total_score || 0;
    document.getElementById('profileStreak').textContent = userProfile.current_streak || 0;

    // Set profile avatar
    const avatarImg = document.getElementById('profileAvatar');
    if (userProfile.avatar_url) {
        avatarImg.src = userProfile.avatar_url;
        avatarImg.style.display = 'block';
    }

    // Calculate and display global rank
    await calculateGlobalRank();
}

async function calculateGlobalRank() {
    if (!allUsers.length) {
        const { data: users } = await supabaseClient
            .from('profiles')
            .select('id, total_score')
            .order('total_score', { ascending: false });
        allUsers = users || [];
    }

    const userRank = allUsers.findIndex(u => u.id === userProfile.id) + 1;
    const totalUsers = allUsers.length;

    document.getElementById('profileRank').textContent = `Rank: #${userRank} / ${totalUsers} users`;
}

// ========================================
// FAVORITES
// ========================================

async function loadFavorites() {
    const { data } = await supabaseClient
        .from('favorites')
        .select('problem_id')
        .eq('user_id', userProfile.id);

    userFavorites = (data || []).map(f => f.problem_id);
}

async function toggleFavorite(problemId) {
    const isFavorite = userFavorites.includes(problemId);

    if (isFavorite) {
        // Remove from favorites
        await supabaseClient
            .from('favorites')
            .delete()
            .eq('user_id', userProfile.id)
            .eq('problem_id', problemId);

        userFavorites = userFavorites.filter(id => id !== problemId);
    } else {
        // Add to favorites
        await supabaseClient
            .from('favorites')
            .insert({
                user_id: userProfile.id,
                problem_id: problemId
            });

        userFavorites.push(problemId);
    }

    renderProblems();
}

window.openProblem = openProblem;
window.toggleFavorite = toggleFavorite;

// ========================================
// DRY RUN FUNCTIONS
// ========================================

async function loadDryRunProblems() {
    const categories = ['easy', 'medium', 'hard'];
    let id = 1;

    for (const difficulty of categories) {
        try {
            const response = await fetch(`/problems/DryRun/dryrun_${difficulty}.json`);
            const data = await response.json();

            data.problems.forEach(problem => {
                allDryRunProblems.push({
                    id: id++,
                    ...problem,
                    category: data.category
                });
            });
        } catch (error) {
        }
    }
}

async function renderDryRunProblems() {
    const container = document.getElementById('dryrunGrid');
    if (!container) return;

    let filtered = allDryRunProblems;

    // Filter by difficulty
    if (currentDryRunDifficultyFilter !== 'all') {
        filtered = filtered.filter(p => p.difficulty === currentDryRunDifficultyFilter);
    }

    // Get solved dry runs from Supabase - parse IDs as integers
    const { data: solvedDryRunsData } = await supabaseClient
        .from('submissions')
        .select('problem_id')
        .eq('user_id', userProfile.id)
        .eq('status', 'accepted')
        .like('problem_id', 'dryrun_%');

    const solvedDryRunIds = new Set(solvedDryRunsData?.map(s => {
        // Extract number from 'dryrun_1' format
        const match = s.problem_id.match(/dryrun_(\d+)/);
        return match ? parseInt(match[1]) : null;
    }).filter(id => id !== null) || []);

    // Filter by solved/unsolved status
    if (currentDryRunStatusFilter === 'solved') {
        filtered = filtered.filter(p => solvedDryRunIds.has(p.id));
    } else if (currentDryRunStatusFilter === 'unsolved') {
        filtered = filtered.filter(p => !solvedDryRunIds.has(p.id));
    }

    container.innerHTML = filtered.map(problem => {
        const isSolved = solvedDryRunIds.has(problem.id);
        return `
        <div class="problem-card ${isSolved ? 'solved' : ''}" onclick="openDryRunProblem(${problem.id})">
            <div class="problem-card-header">
                <div class="problem-card-title">
                    <h3>${isSolved ? '✅ ' : ''}${problem.title}</h3>
                    <span class="difficulty-badge ${problem.difficulty}">${problem.difficulty}</span>
                </div>
            </div>
            <p>${problem.description}</p>
            <div class="problem-meta">
                <span>${problem.points} pts</span>
                <span>${problem.category}</span>
                ${isSolved ? '<span style="color: var(--easy); font-weight: 600;">● Solved</span>' : '<span style="color: var(--text-muted);">○ Unsolved</span>'}
            </div>
        </div>
    `;
    }).join('');
}

async function openDryRunProblem(problemId) {
    currentDryRun = allDryRunProblems.find(p => p.id === problemId);
    if (!currentDryRun) return;

    // Reset state
    hasViewedExplanation = false;

    // Populate UI
    document.getElementById('dryrunTitle').textContent = currentDryRun.title;
    document.getElementById('dryrunDifficulty').textContent = currentDryRun.difficulty;
    document.getElementById('dryrunDifficulty').className = `difficulty-badge ${currentDryRun.difficulty}`;
    document.getElementById('dryrunDescription').textContent = currentDryRun.description;

    // Display code with syntax highlighting using Prism.js
    const codeEditorContainer = document.getElementById('dryrunCodeEditor');
    const escapedCode = escapeHtml(currentDryRun.code);
    codeEditorContainer.innerHTML = `<pre style="margin: 0; border-radius: 8px; font-size: 18px; line-height: 1.6;"><code class="language-cpp">${escapedCode}</code></pre>`;

    // Apply Prism syntax highlighting with safety check
    if (typeof Prism !== 'undefined' && Prism.highlightAllUnder) {
        try {
            Prism.highlightAllUnder(codeEditorContainer);
        } catch (error) {
        }
    }

    // Clear previous answer and output
    document.getElementById('dryrunAnswer').value = '';
    document.getElementById('explanationSection').style.display = 'none';
    clearDryRunOutput();

    // Check if dry run is already solved and show/hide submit button
    await checkIfDryRunSolved(problemId);

    showScreen('dryrunScreen');
}

async function checkIfDryRunSolved(dryRunId) {

    // Check Supabase for solved status
    const { data: submission } = await supabaseClient
        .from('submissions')
        .select('id')
        .eq('user_id', userProfile.id)
        .eq('problem_id', `dryrun_${dryRunId}`) // Use dryrun_ prefix
        .eq('status', 'accepted')
        .single();

    const submitBtn = document.getElementById('submitDryRunBtn');
    if (submission) {
        // Already solved - hide submit button
        if (submitBtn) {
            submitBtn.style.display = 'none';
        }
        return true;
    } else {
        // Not solved - show submit button
        if (submitBtn) {
            submitBtn.style.display = 'inline-block';
        }
        return false;
    }
}

function markDryRunAsSolved(dryRunId) {
    solvedDryRuns.add(dryRunId);
    localStorage.setItem('solvedDryRuns', JSON.stringify([...solvedDryRuns]));

    // Refresh the dry run list to update UI
    renderDryRunProblems();
}

// Success Modal Functions
const motivationalMessages = [
    "You're crushing it! PF finals don't stand a chance! 🔥",
    "That's the spirit! One problem down, finals conquered! 💪",
    "Brilliant work! You're becoming a C++ master! ⚡",
    "Keep this momentum going! Finals are getting easier! 🚀",
    "Absolutely nailed it! Your hard work is paying off! 🎯",
    "You're on fire! This is exactly how you ace finals! 🌟",
    "Fantastic! You're building serious problem-solving skills! 💡",
    "Impressive! You're ready to dominate those finals! 👑",
    "Outstanding! Every problem makes you stronger! 💪",
    "Excellent work! Finals preparation level: EXPERT! 🏆"
];

function showSuccessModal(points, isDryRun = false) {
    const modal = document.getElementById('successModal');
    const title = document.getElementById('successTitle');
    const message = document.getElementById('successMessage');
    const pointsEl = document.getElementById('successPoints');

    // Random motivational message
    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

    title.textContent = isDryRun ? "Dry Run Mastered!" : "Problem Solved!";
    message.textContent = randomMessage;
    pointsEl.textContent = `+${points} points`;

    // Show modal
    modal.style.display = 'flex';

    // Close button handler
    document.getElementById('closeSuccessModal').onclick = () => {
        modal.style.display = 'none';
    };

    // Close on background click
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function viewDryRunExplanation() {
    if (hasViewedExplanation) {
        // Already viewed, just show it
        document.getElementById('explanationSection').style.display = 'block';
        return;
    }

    // Confirm with user
    const confirmed = confirm(
        '⚠️ WARNING: Viewing the explanation will give you 0 points even if you submit the correct answer later.\\n\\nAre you sure you want to continue?'
    );

    if (confirmed) {
        hasViewedExplanation = true;
        document.getElementById('explanationContent').textContent = currentDryRun.explanation;
        document.getElementById('explanationSection').style.display = 'block';
    }
}

async function submitDryRunAnswer() {
    // Prevent multiple simultaneous submissions
    if (isDryRunSubmitting) {
        return;
    }

    isDryRunSubmitting = true;
    const submitBtn = document.getElementById('submitDryRunBtn');
    const userAnswer = document.getElementById('dryrunAnswer').value;
    const expectedOutput = currentDryRun.expectedOutput;

    // Disable button to prevent multiple clicks
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    // Check if user already solved this dry run FIRST
    const { data: previousSubmissions } = await supabaseClient
        .from('submissions')
        .select('status')
        .eq('user_id', userProfile.id)
        .eq('problem_id', `dryrun_${currentDryRun.id}`) // Use dryrun_ prefix
        .eq('status', 'accepted') // Use 'accepted' instead of 'correct'
        .limit(1);

    const alreadySolved = previousSubmissions && previousSubmissions.length > 0;

    // Trim whitespace from both strings for fair comparison
    const isCorrect = userAnswer.trim() === expectedOutput.trim();

    if (isCorrect && !hasViewedExplanation) {
        if (alreadySolved) {
            // Already solved - no points
            displayDryRunOutput(`✅ Correct!

    (Already solved - no points awarded)`, 'success');
            await saveDryRunSubmission(userAnswer, 'correct', 0);
        } else {
            // First time solving - full points, mark as solved
            await updateUserScore(currentDryRun.points);
            markDryRunAsSolved(currentDryRun.id); // Cache in localStorage
            showSuccessModal(currentDryRun.points, true); // Show motivational popup
            await saveDryRunSubmission(userAnswer, 'correct', currentDryRun.points);
        }
    } else if (isCorrect && hasViewedExplanation) {
        // Correct answer but viewed explanation = 0 points
        displayDryRunOutput(
            `✅ Your answer is correct!

    However, you viewed the explanation before submitting.

Points earned: 0`,
            'success'
        );
        await saveDryRunSubmission(userAnswer, 'viewed_explanation', 0);
    } else {
        // Wrong answer = 0 points
        displayDryRunOutput(
            `❌ Incorrect Answer

Your Output:
${userAnswer}

Expected Output:
${expectedOutput}

Points earned: 0`,
            'error'
        );
        await saveDryRunSubmission(userAnswer, 'wrong', 0);
    }

    // Show explanation after submission
    if (!hasViewedExplanation) {
        document.getElementById('explanationContent').textContent = currentDryRun.explanation;
        document.getElementById('explanationSection').style.display = 'block';
        // Remove the warning since they submitted first
        const warningDiv = document.querySelector('#explanationSection > div:last-child');
        if (warningDiv) warningDiv.style.display = 'none';
    }

    // Re-enable button and unlock
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Answer';
    isDryRunSubmitting = false;
}

async function saveDryRunSubmission(userAnswer, status, points) {
    // Convert status 'correct' to 'accepted' to match regular problems
    const normalizedStatus = status === 'correct' ? 'accepted' : status;

    await supabaseClient.from('submissions').insert({
        user_id: userProfile.id,
        problem_id: `dryrun_${currentDryRun.id}`, // Prefix with 'dryrun_' to distinguish from regular problems
        code: `DRY RUN ANSWER:\n${userAnswer}`,
        status: normalizedStatus,
        test_cases_passed: normalizedStatus === 'accepted' ? 1 : 0,
        test_cases_total: 1,
        points_earned: points
    });
}

function displayDryRunOutput(text, type = '') {
    document.getElementById('dryrunOutput').innerHTML = `< pre class="output-${type}" > ${text}</pre > `;
}

function clearDryRunOutput() {
    document.getElementById('dryrunOutput').innerHTML = '<p class="output-placeholder">Submit your answer to see the result...</p>';
}

window.openDryRunProblem = openDryRunProblem;
