# Lakshana Salon - Vercel Deployment Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Lakshana Salon - Vercel Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if logged in to Vercel
Write-Host "Checking Vercel login status..." -ForegroundColor Yellow
$vercelWhoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in to Vercel" -ForegroundColor Red
    Write-Host "Please run: vercel login" -ForegroundColor Yellow
    exit 1
}
Write-Host "Logged in as: $vercelWhoami" -ForegroundColor Green
Write-Host ""

# Deploy to Vercel
Write-Host "Starting deployment to Vercel..." -ForegroundColor Cyan
Write-Host "This will take 2-5 minutes..." -ForegroundColor Yellow
Write-Host ""

# Deploy with automatic answers
vercel --yes --name lakshana-salon

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Add Environment Variables:" -ForegroundColor White
    Write-Host "   Go to Vercel Dashboard" -ForegroundColor Gray
    Write-Host "   Project Settings > Environment Variables" -ForegroundColor Gray
    Write-Host "   Add all Firebase credentials" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Redeploy with variables:" -ForegroundColor White
    Write-Host "   vercel --prod" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "3. Test your site!" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "   DEPLOYMENT FAILED" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the error messages above." -ForegroundColor Yellow
    Write-Host ""
}
