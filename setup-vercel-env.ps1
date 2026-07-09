# ═══════════════════════════════════════════════════════
#  Vercel Environment Variables Setup Script
#  Run this to fix Firebase Cloud Messaging errors
# ═══════════════════════════════════════════════════════

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "  Lakshana Salon - Vercel Environment Setup" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host ""

# Check if .env.local exists
if (-Not (Test-Path ".env.local")) {
    Write-Host "❌ ERROR: .env.local file not found!" -ForegroundColor Red
    Write-Host "   Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Reading environment variables from .env.local..." -ForegroundColor Cyan
Write-Host ""

# Read .env.local and parse Firebase variables
$envContent = Get-Content ".env.local" -Raw
$envLines = $envContent -split "`n"

# Extract Firebase variables
$firebaseVars = @{}
foreach ($line in $envLines) {
    if ($line -match '^\s*#' -or $line -match '^\s*$') {
        continue
    }
    
    if ($line -match '^(NEXT_PUBLIC_FIREBASE_|FIREBASE_)') {
        $parts = $line -split '=', 2
        if ($parts.Count -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
            
            # Remove quotes if present
            $value = $value -replace '^"(.*)"$', '$1'
            
            $firebaseVars[$key] = $value
        }
    }
}

Write-Host "✅ Found $($firebaseVars.Count) Firebase environment variables" -ForegroundColor Green
Write-Host ""

# Display variables (with masked values for security)
Write-Host "Variables to be added to Vercel:" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────" -ForegroundColor Gray
foreach ($key in $firebaseVars.Keys | Sort-Object) {
    $displayValue = $firebaseVars[$key]
    
    # Mask sensitive values
    if ($key -match "KEY|SECRET") {
        if ($displayValue.Length -gt 20) {
            $displayValue = $displayValue.Substring(0, 10) + "..." + $displayValue.Substring($displayValue.Length - 10)
        }
    }
    
    Write-Host "  $key" -ForegroundColor Cyan -NoNewline
    Write-Host " = " -NoNewline
    Write-Host "$displayValue" -ForegroundColor White
}
Write-Host "─────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Check if Vercel CLI is installed
Write-Host "🔍 Checking for Vercel CLI..." -ForegroundColor Cyan
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-Not $vercelInstalled) {
    Write-Host "❌ Vercel CLI not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    Write-Host "   Run: npm install -g vercel" -ForegroundColor White
    Write-Host ""
    Write-Host "After installation, run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Vercel CLI is installed" -ForegroundColor Green
Write-Host ""

# Confirm before proceeding
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "  ⚠️  IMPORTANT: This will add/update environment" -ForegroundColor Yellow
Write-Host "     variables in your Vercel project" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Continue? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "❌ Operation cancelled" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🚀 Adding environment variables to Vercel..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($key in $firebaseVars.Keys | Sort-Object) {
    $value = $firebaseVars[$key]
    
    Write-Host "Adding: $key..." -ForegroundColor Gray -NoNewline
    
    try {
        # Add to production, preview, and development
        $output = vercel env add $key production --force 2>&1
        $output = vercel env add $key preview --force 2>&1
        $output = vercel env add $key development --force 2>&1
        
        Write-Host " ✅" -ForegroundColor Green
        $successCount++
    }
    catch {
        Write-Host " ❌" -ForegroundColor Red
        $failCount++
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "  Results" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host ""
Write-Host "✅ Success: $successCount variables added" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "❌ Failed: $failCount variables" -ForegroundColor Red
}
Write-Host ""

if ($successCount -gt 0) {
    Write-Host "🎉 Environment variables added to Vercel!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Trigger a new deployment in Vercel dashboard" -ForegroundColor White
    Write-Host "   OR run: vercel --prod" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Wait for deployment to complete (~2 minutes)" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Hard refresh your browser: Ctrl + Shift + R" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Check console - Firebase errors should be gone! ✅" -ForegroundColor White
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
