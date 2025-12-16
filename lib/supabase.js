// Supabase Configuration
const SUPABASE_URL = 'https://hvizuvovmdcjixqwmcgw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2aXp1dm92bWRjaml4cXdtY2d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDM0NDYsImV4cCI6MjA4MTQ3OTQ0Nn0.pfvvAIKg0YCddlNAvyj8tmkqBAJH_eanSYAqNgXzxBo';

// Initialize Supabase client (using global from CDN)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabaseClient;
