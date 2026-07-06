# PowerShell script to fix TypeScript errors in Firebase API routes

Write-Host "Fixing TypeScript errors..." -ForegroundColor Cyan

$files = @(
    "src\app\api\admin\coupons\route.ts",
    "src\app\api\admin\customers\route.ts",
    "src\app\api\admin\dashboard\route.ts",
    "src\app\api\admin\dashboard\stats\route.ts",
    "src\app\api\admin\export\route.ts",
    "src\app\api\admin\notifications\clear\route.ts",
    "src\app\api\admin\notifications\route.ts",
    "src\app\api\admin\reports\route.ts",
    "src\app\api\admin\services\route.ts",
    "src\app\api\cms\gallery\route.ts",
    "src\app\api\cms\reviews\route.ts",
    "src\app\api\fcm-token\cleanup\route.ts",
    "src\app\api\fcm-token\delete-all\route.ts",
    "src\app\api\fcm-token\list\route.ts",
    "src\app\api\notify\route.ts",
    "src\app\api\test-reviews\route.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing: $file"
        $content = Get-Content $file -Raw
        
        $content = $content -replace 'snap\.docs\.map\(d =>', 'snap.docs.map((d: any) =>'
        $content = $content -replace 'tokensSnap\.docs\.map\(d =>', 'tokensSnap.docs.map((d: any) =>'
        $content = $content -replace '\.map\(d =>', '.map((d: any) =>'
        $content = $content -replace '\.filter\(b =>', '.filter((b: any) =>'
        $content = $content -replace '\.filter\(c =>', '.filter((c: any) =>'
        $content = $content -replace '\.filter\(img =>', '.filter((img: any) =>'
        $content = $content -replace '\.filter\(l =>', '.filter((l: any) =>'
        $content = $content -replace '\.filter\(t =>', '.filter((t: any) =>'
        $content = $content -replace '\.forEach\(doc =>', '.forEach((doc: any) =>'
        $content = $content -replace '\.forEach\(d =>', '.forEach((d: any) =>'
        $content = $content -replace '\.forEach\(c =>', '.forEach((c: any) =>'
        $content = $content -replace '\.forEach\(b =>', '.forEach((b: any) =>'
        $content = $content -replace '\.forEach\(l =>', '.forEach((l: any) =>'
        $content = $content -replace '\.reduce\(\(sum,', '.reduce((sum: any,'
        $content = $content -replace '\.reduce\(\(s,', '.reduce((s: any,'
        $content = $content -replace '\.forEach\(\(response,', '.forEach((response: any,'
        $content = $content -replace '\(response, idx\)', '(response: any, idx: any)'
        $content = $content -replace '\.filter\(doc =>', '.filter((doc: any) =>'
        $content = $content -replace '\.filter\(apt =>', '.filter((apt: any) =>'
        $content = $content -replace '\.filter\(addon =>', '.filter((addon: any) =>'
        
        Set-Content -Path $file -Value $content -NoNewline
        Write-Host "Fixed: $file" -ForegroundColor Green
    }
}

Write-Host "Done!" -ForegroundColor Cyan
