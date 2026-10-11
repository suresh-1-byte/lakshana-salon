# Script to add all environment variables to Vercel
$envVars = @(
    @{name="NEXT_PUBLIC_FIREBASE_API_KEY"; value="AIzaSyAH8i8dTKxQA6y0PB2_k9aOzO7RROvnpkI"},
    @{name="NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"; value="lakshana-beauty-5ff20.firebaseapp.com"},
    @{name="NEXT_PUBLIC_FIREBASE_PROJECT_ID"; value="lakshana-beauty-5ff20"},
    @{name="NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"; value="lakshana-beauty-5ff20.firebasestorage.app"},
    @{name="NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"; value="206527136985"},
    @{name="NEXT_PUBLIC_FIREBASE_APP_ID"; value="1:206527136985:web:384da17fe3d81aeaa76ac8"},
    @{name="NEXT_PUBLIC_FIREBASE_VAPID_KEY"; value="BLDoXYvl0pbR8zOGyL_sH7-klC5DYsYMznFNQnlOKj8UofHUkK_KbZnC2-Sxn32tG196wqdl2Opf73SM4kzoyPY"},
    @{name="FIREBASE_PROJECT_ID"; value="lakshana-beauty-5ff20"},
    @{name="FIREBASE_CLIENT_EMAIL"; value="firebase-adminsdk-fbsvc@lakshana-beauty-5ff20.iam.gserviceaccount.com"},
    @{name="FIREBASE_PRIVATE_KEY"; value="`"-----BEGIN PRIVATE KEY-----
REDACTED_ROTATE_THIS_KEY
-----END PRIVATE KEY-----\n`""},
    @{name="ADMIN_EMAIL"; value="admin@lakshanasalon.com"},
    @{name="ADMIN_PASSWORD"; value="Admin@123"},
    @{name="JWT_SECRET"; value="lakshana-beauty-salon-jwt-secret-2025-change-me"},
    @{name="RESEND_API_KEY"; value="re_REDACTED_ROTATE_THIS_KEY"}
)

Write-Host "Adding environment variables to Vercel..." -ForegroundColor Green

foreach ($env in $envVars) {
    Write-Host "`nAdding: $($env.name)" -ForegroundColor Yellow
    $value = $env.value
    echo $value | vercel env add $env.name production
}

Write-Host "`n✅ All variables added! Now redeploy with: vercel --prod --force" -ForegroundColor Green
