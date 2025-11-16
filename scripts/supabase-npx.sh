#!/bin/bash
# Wrapper script to run Supabase CLI via npx
# Usage: ./scripts/supabase-npx.sh [command] [args...]

npx supabase@latest "$@"
