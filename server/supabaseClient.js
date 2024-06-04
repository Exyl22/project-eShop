import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://amtputzbykyjzgbukxsk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtdHB1dHpieWt5anpnYnVreHNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTczNDQ1OTcsImV4cCI6MjAzMjkyMDU5N30.FD2RQfv3Vr-Mlt3aiSLkD18jruvIMcq_4tTy6DfXtwk';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;