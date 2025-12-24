import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // Need service key for bulk insert

const DRY_RUN = process.argv.includes('--dry-run');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing environment variables!');
    console.error('Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY');
    console.error('\nAdd SUPABASE_SERVICE_KEY to your .env file');
    console.error('Get it from: Supabase Dashboard → Project Settings → API → service_role key');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Category mapping to determine track
const CATEGORY_TO_TRACK = {
    // PF Track
    'Arrays': 'pf',
    'Pointers': 'pf',
    'Functions': 'pf',
    'DynamicMemory': 'pf',
    'Bitwise': 'pf',
    'DryRun': 'pf'
};

// Determine track from wrapper category or problem category
function getTrack(wrapperCategory, problemCategory) {
    // If wrapper is "PF Lab", always use pf-lab track
    if (wrapperCategory === 'PF Lab' || wrapperCategory === 'PF Lab Advanced Practice') {
        return 'pf-lab';
    }

    // Otherwise use category mapping
    return CATEGORY_TO_TRACK[problemCategory] || CATEGORY_TO_TRACK[wrapperCategory] || 'pf';
}

// Generate unique ID for problem (includes difficulty to prevent duplicates)
function generateProblemId(track, category, difficulty, title, index) {
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return `${track}-${category.toLowerCase()}-${difficulty}-${slug}-${String(index).padStart(3, '0')}`;
}

// Transform JSON problem to database schema
function transformProblem(problem, category, track, index) {
    // Use problem's own category if it exists, otherwise use wrapper category
    const finalCategory = problem.category || category;

    return {
        id: generateProblemId(track, finalCategory, problem.difficulty, problem.title, index),
        track: track,
        category: finalCategory,
        title: problem.title,
        difficulty: problem.difficulty,
        description: problem.description,
        input_format: problem.inputFormat,
        output_format: problem.outputFormat,
        constraints: problem.constraints,
        starter_code_cpp: problem.starterCode,
        points: problem.points || 10,
        time_limit_ms: problem.timeLimit || 1000,
        memory_limit_mb: problem.memoryLimit || 256,
        sample_test_cases: problem.sampleTestCases || [],
        hidden_test_cases: problem.hiddenTestCases || [],
        tags: [finalCategory.toLowerCase(), problem.difficulty],
        is_active: true,
        premium_only: false
    };
}

// Read all JSON files from problems directory
async function importProblems() {
    const problemsDir = path.join(__dirname, '..', 'public', 'problems');
    const categories = fs.readdirSync(problemsDir).filter(f => {
        const stat = fs.statSync(path.join(problemsDir, f));
        return stat.isDirectory();
    });

    console.log('📚 Found categories:', categories.join(', '));
    console.log('');

    let totalProblems = 0;
    let successCount = 0;
    let errorCount = 0;
    const allProblems = [];

    for (const category of categories) {
        const categoryPath = path.join(problemsDir, category);
        const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.json'));

        console.log(`\n📁 Processing category: ${category}`);
        console.log(`   Files: ${files.join(', ')}`);

        for (const file of files) {
            const filePath = path.join(categoryPath, file);
            console.log(`   Reading: ${file}`);

            try {
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                const data = JSON.parse(fileContent);

                const wrapperCategory = data.category || category;
                let problemIndex = 1;

                for (const problem of data.problems) {
                    try {
                        const track = getTrack(wrapperCategory, problem.category);
                        const transformed = transformProblem(problem, wrapperCategory, track, problemIndex);
                        allProblems.push(transformed);

                        console.log(`      ✓ ${problem.title} → ${transformed.id}`);
                        problemIndex++;
                        totalProblems++;
                    } catch (problemError) {
                        console.error(`      ✗ Error processing problem "${problem.title}" in ${file}:`, problemError.message);
                        errorCount++;
                    }
                }
            } catch (error) {
                console.error(`      ✗ Error reading ${file}:`, error.message);
                errorCount++;
            }
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`📊 Total problems to import: ${totalProblems}`);
    console.log('='.repeat(60) + '\n');

    if (DRY_RUN) {
        console.log('🔍 DRY RUN MODE - No data will be inserted\n');
        console.log('Sample problems:');
        allProblems.slice(0, 3).forEach(p => {
            console.log(`\n${p.id}:`);
            console.log(`  Title: ${p.title}`);
            console.log(`  Difficulty: ${p.difficulty}`);
            console.log(`  Sample tests: ${p.sample_test_cases.length}`);
            console.log(`  Hidden tests: ${p.hidden_test_cases.length}`);
        });
        console.log('\n✅ Dry run complete! Run without --dry-run to import.');
        return;
    }

    // Insert into database (in batches of 50 for safety)
    console.log('🚀 Starting database import...\n');
    const BATCH_SIZE = 50;

    for (let i = 0; i < allProblems.length; i += BATCH_SIZE) {
        const batch = allProblems.slice(i, i + BATCH_SIZE);

        try {
            const { data, error } = await supabase
                .from('problems')
                .upsert(batch, { onConflict: 'id' });

            if (error) throw error;

            successCount += batch.length;
            console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: Imported ${batch.length} problems`);
        } catch (error) {
            console.error(`❌ Batch error:`, error.message);
            errorCount += batch.length;
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully imported: ${successCount} problems`);
    console.log(`❌ Failed: ${errorCount} problems`);
    console.log(`📈 Success rate: ${((successCount / totalProblems) * 100).toFixed(1)}%`);
    console.log('='.repeat(60) + '\n');

    // Verify import
    const { count, error } = await supabase
        .from('problems')
        .select('*', { count: 'exact', head: true });

    if (!error) {
        console.log(`🔍 Database verification: ${count} total problems in database\n`);
    }

    console.log('🎉 Import complete!\n');
}

// Run import
importProblems().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
