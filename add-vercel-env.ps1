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
    @{name="FIREBASE_PRIVATE_KEY"; value="`"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC8/cX1gcyzLgz8\n0oTSn8oq99IWJHN5o0QWdpQLCyIRpKmLtDCS/bekrhd45mRYdxeLhH/yLyInwhwr\noeSSZSM11wDMNjwGN/lNbnTablw1rhrEkV29d7c9R66K5N4WGtBQgZbM3x7iSqJz\nZUCH1YcOYunZgbm06tx9IyHUhnBJKo5jIUt5gXHFIqDflGkj7vLU6J5NxMB+cfkY\nVgaqFECmoUzGEP5TBrzZV0syUtzpTYM6efDoAiNibS2lXJSZ+TfJsVNfdgTAH27W\nuKHLE0WXCNFmRmwCjNrI6aBBy8dRV2Bm2TMsN7e2pTmJpUP1tbPcG4BpzdVEV7rf\n8LRSzMtbAgMBAAECggEAUZwUO6vNRSKBoTsW+AzgNCXHpqAe7Uu/PyP9UbeBArVk\nMVuiDhdZkddLc32pnznuBOU2itInoZuEpqLGHSFnTvyE76oLyXOqR/GGrDwzvUpt\nbKyJGiP0EJY/nOKvtEPn6JvNDrLal0U7WTFD6GQgaen0qWQHWUSB6ded6DQVkMH9\nGiyc4LwJpaR3rxDPg7fLkWeNHD5vBgoi1lb6m84ihyBKyYr2jtk5pgW3nvS3BHtw\nj0p5yuxRYYXXQbSjqQBp0c/HXTuStfTg7sgWMwI0kT5djhTetq5bVqc+YYJvf7SO\nqol7RPAyAdHHIhQBZsX5Yxd0paU8uTsDNDxx4+9hgQKBgQDulv+1NRijCD15WqNC\nyOTdhjtn/4wyfc36ea3MMLZ96trcBAn0uY6qcwgWaQTXQnmxi7wrTwhCkEPNNqd8\nCij8bjpYV3MJzdczL7R3VBGUMvZ2DmXJ2i5kcL7ctEcNiv/cDsRUzdZu4nvvtu24\n0wFeMTjSzdcZE/eom1ux0E9X0QKBgQDKyD54XgTrPEdq3InSZ5CxdyyXpEUd+S0f\ngahUESZ8q5yYQQRAHKxaVvkleXr7CfweS4jAvH1LeVZrHFqpEJc3ibFxYRHHqQOH\ntrX2xDgUuGO1b88mRMN4EnQr3R2FQLb8AwxionJM5jgK7+OMMikZH1py34B3F4T5\nj6qg4e5nawKBgQCjMb+IF+BZK3q49gkz1ivNZlJeCUrBApIQYIhDYZKBwFGhKlYR\nAZcW+YWvpne8MWkByz2TNgTFWt41kMuwqVZti4v2/yHds+EdzuSWtncrskwoZiKz\nlbwj0YaLefgbyFbIE4WxJ/YjdGEnjy09PX7zCaH/dvJI4gKFXnaywnRy8QKBgBJQ\neYvneexA+nZFStFM9z1/9PARLwjg+1lQHYLSNbamzTLXFGox7MMP/dqLmTbZFQMr\ncUNvAqXxZIOyAOIqFG44qmUCDlgJBL+aGd8ao7IDYUX+vifHqBvNFt7rToI9cQlb\nwR+balVVqZQbTGLaGOoi8clUNEcNQb5EYnW7UgvXAoGBAM4FIttVq+C/mGX3lIMp\n3vOCka2i5NBUSFnJ0H/WdeV+7vOF3jZFucRJ9roA5oJje3Rok45FUb+ANimTfv2Z\nHQO7i2SmhVXzGEgUrb1t6yAkGXEWryNiyoVxPjTgD3zCwWjAPKO5mcBRxl39JYed\nZlmzAjD/hvySrYDXHRzUshHh\n-----END PRIVATE KEY-----\n`""},
    @{name="ADMIN_EMAIL"; value="admin@lakshanasalon.com"},
    @{name="ADMIN_PASSWORD"; value="Admin@123"},
    @{name="JWT_SECRET"; value="lakshana-beauty-salon-jwt-secret-2025-change-me"},
    @{name="RESEND_API_KEY"; value="re_abrKjUjz_9vq2RxEbFx6UFurevXnmB1Ai"}
)

Write-Host "Adding environment variables to Vercel..." -ForegroundColor Green

foreach ($env in $envVars) {
    Write-Host "`nAdding: $($env.name)" -ForegroundColor Yellow
    $value = $env.value
    echo $value | vercel env add $env.name production
}

Write-Host "`n✅ All variables added! Now redeploy with: vercel --prod --force" -ForegroundColor Green
