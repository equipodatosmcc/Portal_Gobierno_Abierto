$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:3000"
$cookieFile = Join-Path $env:TEMP "gobabierto_cookies.txt"

if (Test-Path $cookieFile) {
  Remove-Item $cookieFile -Force
}

Write-Host "1) Verificando OpenAPI y Swagger..."
$openapiRaw = curl.exe -s -c $cookieFile "$baseUrl/api/openapi"
$openapi = $openapiRaw | ConvertFrom-Json
if (-not $openapi.paths."/api/news") {
  throw "OpenAPI no contiene /api/news"
}
if (-not $openapi.paths."/api/texts") {
  throw "OpenAPI no contiene /api/texts"
}

$swaggerStatus = curl.exe -s -o NUL -w "%{http_code}" "$baseUrl/api/swagger"
if ($swaggerStatus -ne "200") {
  throw "Swagger no responde 200 (status=$swaggerStatus)"
}

Write-Host "2) Verificando bloqueo sin login (POST /api/texts)..."
$unauthStatus = $null
try {
  $null = Invoke-WebRequest -Uri "$baseUrl/api/texts" -Method Post -ContentType "application/json" -Body '{"slug":"x","title":"x","content":"x","published":false}'
  $unauthStatus = 200
} catch {
  $response = $_.Exception.Response
  if ($null -ne $response) {
    $unauthStatus = [int]$response.StatusCode
  }
}

if ($unauthStatus -ne 403) {
  throw "Se esperaba 403 sin login y devolvio $unauthStatus"
}

Write-Host "3) Login con NextAuth (credentials)..."
$csrfRaw = curl.exe -s -c $cookieFile "$baseUrl/api/auth/csrf"
$csrf = $csrfRaw | ConvertFrom-Json
if (-not $csrf.csrfToken) {
  throw "No se obtuvo csrfToken"
}

$null = curl.exe -s -b $cookieFile -c $cookieFile -X POST "$baseUrl/api/auth/callback/credentials" -H "Content-Type: application/x-www-form-urlencoded" --data-urlencode "csrfToken=$($csrf.csrfToken)" --data-urlencode "email=admin@gobierno.gob.ar" --data-urlencode "password=admin123" --data-urlencode "callbackUrl=$baseUrl/admin" --data-urlencode "json=true"

$sessionRaw = curl.exe -s -b $cookieFile "$baseUrl/api/auth/session"
$session = $sessionRaw | ConvertFrom-Json
if ($session.user.email -ne "admin@gobierno.gob.ar") {
  throw "Login fallo: no hay sesion admin valida"
}

Write-Host "4) CRUD Textos (/api/texts)..."
$textSlug = "texto-prueba-$(Get-Date -Format 'yyyyMMddHHmmss')"
$textCreateRaw = curl.exe -s -b $cookieFile -X POST "$baseUrl/api/texts" -F "slug=$textSlug" -F "title=Texto prueba" -F "content=Contenido inicial" -F "published=true"
$textCreated = $textCreateRaw | ConvertFrom-Json
if (-not $textCreated.id) {
  throw "No se pudo crear texto"
}

$textUpdateRaw = curl.exe -s -b $cookieFile -X PATCH "$baseUrl/api/texts/$($textCreated.id)" -F "title=Texto prueba actualizado" -F "content=Contenido actualizado"
$textUpdated = $textUpdateRaw | ConvertFrom-Json
if ($textUpdated.title -ne "Texto prueba actualizado") {
  throw "No se actualizo el texto"
}

$textDeleteRaw = curl.exe -s -b $cookieFile -X DELETE "$baseUrl/api/texts/$($textCreated.id)"
$textDeleted = $textDeleteRaw | ConvertFrom-Json
if ($textDeleted.id -ne $textCreated.id) {
  throw "No se elimino el texto"
}

Write-Host "5) CRUD Noticias + upload + reemplazo + borrado fisico..."
$img1Path = Join-Path $env:TEMP "news-test-1.png"
$img2Path = Join-Path $env:TEMP "news-test-2.png"
$pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7ZxX8AAAAASUVORK5CYII="
[System.IO.File]::WriteAllBytes($img1Path, [Convert]::FromBase64String($pngBase64))
[System.IO.File]::WriteAllBytes($img2Path, [Convert]::FromBase64String($pngBase64))

$newsSlug = "noticia-prueba-$(Get-Date -Format 'yyyyMMddHHmmss')"
$newsCreateRaw = curl.exe -s -b $cookieFile -X POST "$baseUrl/api/news" -F "title=Noticia Prueba" -F "slug=$newsSlug" -F "content=Contenido inicial noticia" -F "category=General" -F "published=true" -F "image=@$img1Path;type=image/png"
$newsCreated = $newsCreateRaw | ConvertFrom-Json
if (-not $newsCreated.id) {
  throw "No se pudo crear noticia"
}
if (-not $newsCreated.image) {
  throw "La noticia no devolvio URL de imagen"
}

$oldImageRelative = $newsCreated.image.TrimStart("/")
$oldImagePath = Join-Path (Get-Location) (Join-Path "public" ($oldImageRelative -replace "/", "\\"))
if (-not (Test-Path $oldImagePath)) {
  throw "No existe imagen creada en disco: $oldImagePath"
}

$newsUpdateRaw = curl.exe -s -b $cookieFile -X PATCH "$baseUrl/api/news/$($newsCreated.id)" -F "title=Noticia Prueba Editada" -F "content=Contenido editado noticia" -F "image=@$img2Path;type=image/png"
$newsUpdated = $newsUpdateRaw | ConvertFrom-Json
if ($newsUpdated.title -ne "Noticia Prueba Editada") {
  throw "No se actualizo la noticia"
}
if (-not $newsUpdated.image) {
  throw "La noticia editada no devolvio imagen"
}
if ($newsUpdated.image -eq $newsCreated.image) {
  throw "No cambio la imagen al editar"
}

$newImageRelative = $newsUpdated.image.TrimStart("/")
$newImagePath = Join-Path (Get-Location) (Join-Path "public" ($newImageRelative -replace "/", "\\"))
if (-not (Test-Path $newImagePath)) {
  throw "La nueva imagen no existe en disco"
}
if (Test-Path $oldImagePath) {
  throw "La imagen anterior no fue eliminada tras editar"
}

$newsDeleteRaw = curl.exe -s -b $cookieFile -X DELETE "$baseUrl/api/news/$($newsCreated.id)"
$newsDeleted = $newsDeleteRaw | ConvertFrom-Json
if ($newsDeleted.id -ne $newsCreated.id) {
  throw "No se elimino la noticia"
}
if (Test-Path $newImagePath) {
  throw "La imagen asociada no se elimino al borrar noticia"
}

Write-Host ""
Write-Host "=== RESULTADO E2E ===" -ForegroundColor Green
Write-Host "OpenAPI OK"
Write-Host "Swagger OK"
Write-Host "Auth guard sin login OK (403)"
Write-Host "CRUD Textos OK (id=$($textCreated.id))"
Write-Host "CRUD Noticias + Upload/Reemplazo/Borrado fisico OK (id=$($newsCreated.id))"
