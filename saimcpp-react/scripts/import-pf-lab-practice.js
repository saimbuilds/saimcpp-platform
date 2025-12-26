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
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const DRY_RUN = process.argv.includes('--dry-run');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing environment variables!');
    console.error('Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY');
    console.error('\nAdd SUPABASE_SERVICE_KEY to your .env file');
    console.error('Get it from: Supabase Dashboard → Project Settings → API → service_role key');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Generate unique ID for problem
function generateProblemId(track, category, difficulty, title, index) {
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return `${track}-${category.toLowerCase()}-${difficulty}-${slug}-${String(index).padStart(3, '0')}`;
}

// Transform JSON problem to database schema
function transformProblem(problem, index) {
    const category = problem.category || 'General';
    const difficulty = problem.difficulty || 'medium';

    return {
        id: generateProblemId('pf-lab', category, difficulty, problem.title, index),
        track: 'pf-lab',
        category: category,
        title: problem.title,
        difficulty: difficulty,
        description: problem.description,
        input_format: problem.inputFormat,
        output_format: problem.outputFormat,
        constraints: problem.constraints,
        starter_code_cpp: problem.starterCode,
        points: problem.points || 20,
        time_limit_ms: problem.timeLimit || 1000,
        memory_limit_mb: problem.memoryLimit || 256,
        sample_test_cases: problem.sampleTestCases || [],
        hidden_test_cases: problem.hiddenTestCases || [],
        tags: [category.toLowerCase(), difficulty],
        is_active: true,
        premium_only: false
    };
}

// Import PF Lab practice problems
async function importPFLabProblems() {
    const filePath = path.join(__dirname, '..', 'public', 'pf lab', 'pf_lab_practice.json');

    console.log('📚 Importing PF Lab Practice Questions');
    console.log('📁 File:', filePath);
    console.log('');

    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(fileContent);

        console.log(`✓ Found: ${data.totalProblems || data.problems.length} problems`);
        console.log(`✓ Category: ${data.category}`);
        console.log('');

        const allProblems = [];
        let problemIndex = 1;

        for (const problem of data.problems) {
            try {
                const transformed = transformProblem(problem, problemIndex);
                allProblems.push(transformed);

                console.log(`   ${problemIndex}. ${problem.title} (${problem.difficulty}) → ${transformed.id}`);
                problemIndex++;
            } catch (problemError) {
                console.error(`   ✗ Error processing problem "${problem.title}":`, problemError.message);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log(`📊 Total problems to import: ${allProblems.length}`);
        console.log('='.repeat(60) + '\n');

        if (DRY_RUN) {
            console.log('🔍 DRY RUN MODE - No data will be inserted\n');
            console.log('Sample problems:');
            allProblems.slice(0, 3).forEach(p => {
                console.log(`\n${p.id}:`);
                console.log(`  Title: ${p.title}`);
                console.log(`  Category: ${p.category}`);
                console.log(`  Difficulty: ${p.difficulty}`);
                console.log(`  Points: ${p.points}`);
                console.log(`  Sample tests: ${p.sample_test_cases.length}`);
                console.log(`  Hidden tests: ${p.hidden_test_cases.length}`);
            });
            console.log('\n✅ Dry run complete! Run without --dry-run to import.');
            return;
        }

        // Insert into database (in batches of 50)
        console.log('🚀 Starting database import...\n');
        const BATCH_SIZE = 50;
        let successCount = 0;
        let errorCount = 0;

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
        console.log(`📈 Success rate: ${((successCount / allProblems.length) * 100).toFixed(1)}%`);
        console.log('='.repeat(60) + '\n');

        // Verify import
        const { count, error } = await supabase
            .from('problems')
            .select('*', { count: 'exact', head: true })
            .eq('track', 'pf-lab');

        if (!error) {
            console.log(`🔍 Database verification: ${count} PF Lab problems in database\n`);
        }

        console.log('🎉 Import complete!\n');

    } catch (error) {
        console.error('❌ Error reading file:', error.message);
        process.exit(1);
    }
}

// Run import
importPFLabProblems().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
