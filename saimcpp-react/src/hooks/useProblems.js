import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

/**
 * Custom hook to fetch problems from Supabase with filtering and pagination
 * 
 * @param {Object} options - Query options
 * @param {string} options.track - Track filter ('pf', 'pf-lab', 'oop', 'dsa')
 * @param {string} options.category - Category filter (optional)
 * @param {string} options.difficulty - Difficulty filter ('easy', 'medium', 'hard') (optional)
 * @param {number} options.page - Page number (1-indexed)
 * @param {number} options.limit - Items per page
 * @param {string} options.searchQuery - Search term for title/description (optional)
 * @param {Array<string>} options.tags - Filter by tags (optional)
 * @param {string} options.sortBy - Sort field (default: 'created_at')
 * @param {boolean} options.sortAscending - Sort direction (default: true)
 * 
 * @returns {Object} React Query result with problems data
 */
export function useProblems({
    track,
    category = null,
    difficulty = null,
    page = 1,
    limit = 20,
    searchQuery = null,
    tags = null,
    sortBy = 'created_at',
    sortAscending = true
} = {}) {
    return useQuery({
        queryKey: ['problems', track, category, difficulty, page, limit, searchQuery, tags, sortBy, sortAscending],
        queryFn: async () => {
            let query = supabase
                .from('problems')
                .select('*', { count: 'exact' })
                .eq('is_active', true);

            // Apply track filter (required)
            if (track) {
                query = query.eq('track', track);
            }

            // Apply category filter if provided
            if (category) {
                query = query.eq('category', category);
            }

            // Apply difficulty filter if provided
            if (difficulty) {
                query = query.eq('difficulty', difficulty);
            }

            // Apply tags filter if provided
            if (tags && tags.length > 0) {
                query = query.overlaps('tags', tags);
            }

            // Apply full-text search if query provided
            if (searchQuery) {
                query = query.textSearch('title', searchQuery, {
                    type: 'websearch',
                    config: 'english'
                });
            }

            // Apply sorting
            query = query.order(sortBy, { ascending: sortAscending });

            // Apply pagination
            const start = (page - 1) * limit;
            query = query.range(start, start + limit - 1);

            const { data, error, count } = await query;

            if (error) {
                console.error('Error fetching problems:', error);
                throw error;
            }

            return {
                problems: data || [],
                total: count || 0,
                currentPage: page,
                totalPages: Math.ceil((count || 0) / limit),
                hasMore: start + limit < (count || 0)
            };
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    });
}

/**
 * Hook to fetch a single problem by ID
 * 
 * @param {string} problemId - Problem ID
 * @returns {Object} React Query result with problem data
 */
export function useProblem(problemId) {
    return useQuery({
        queryKey: ['problem', problemId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('problems')
                .select('*')
                .eq('id', problemId)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!problemId,
        staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    });
}

/**
 * Hook to get problem statistics for a track
 * 
 * @param {string} track - Track ID
 * @returns {Object} Statistics including total, by difficulty, by category
 */
export function useProblemStats(track) {
    return useQuery({
        queryKey: ['problem-stats', track],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('problems')
                .select('difficulty, category')
                .eq('track', track)
                .eq('is_active', true);

            if (error) throw error;

            // Calculate statistics
            const stats = {
                total: data.length,
                byDifficulty: {
                    easy: data.filter(p => p.difficulty === 'easy').length,
                    medium: data.filter(p => p.difficulty === 'medium').length,
                    hard: data.filter(p => p.difficulty === 'hard').length,
                },
                byCategory: {}
            };

            // Count by category
            data.forEach(p => {
                stats.byCategory[p.category] = (stats.byCategory[p.category] || 0) + 1;
            });

            return stats;
        },
        staleTime: 15 * 60 * 1000, // Cache for 15 minutes
    });
}

/**
 * Hook to get random problem (Problem of the Day feature)
 * 
 * @param {string} track - Track filter
 * @param {string} difficulty - Optional difficulty filter
 * @returns {Object} React Query result with random problem
 */
export function useRandomProblem(track, difficulty = null) {
    return useQuery({
        queryKey: ['random-problem', track, difficulty, new Date().toDateString()],
        queryFn: async () => {
            let query = supabase
                .from('problems')
                .select('*')
                .eq('track', track)
                .eq('is_active', true);

            if (difficulty) {
                query = query.eq('difficulty', difficulty);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Select random problem client-side
            if (data && data.length > 0) {
                const randomIndex = Math.floor(Math.random() * data.length);
                return data[randomIndex];
            }

            return null;
        },
        staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours (one per day)
    });
}
