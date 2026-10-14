$ErrorActionPreference = 'Stop'
$dev = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$templatePath = Join-Path $dev 'index.html'
$template = Get-Content -LiteralPath $templatePath -Raw -Encoding utf8
$css = Get-Content -LiteralPath (Join-Path $dev 'src\styles\app.css') -Raw -Encoding utf8
$jsFiles = Get-ChildItem -LiteralPath (Join-Path $dev 'src\js') -Filter '*.js' | Sort-Object Name
if (-not $jsFiles) { throw 'Nema JavaScript modula za build.' }
$js = ($jsFiles | ForEach-Object { Get-Content -LiteralPath $_.FullName -Raw -Encoding utf8 }) -join "`n"

$output = [regex]::Replace($template, '<!-- DEV:STYLE -->[\s\S]*?<!-- /DEV:STYLE -->', "<style>`n$css</style>")
$output = [regex]::Replace($output, '<!-- DEV:SCRIPTS -->[\s\S]*?<!-- /DEV:SCRIPTS -->', "<script>`n$js</script>")
$dist = Join-Path $dev 'dist'
New-Item -ItemType Directory -Force -Path $dist | Out-Null
$target = Join-Path $dist 'RSv9-dev.html'
Set-Content -LiteralPath $target -Value $output -Encoding utf8
Set-Content -LiteralPath (Join-Path $dist 'index.html') -Value $output -Encoding utf8
Write-Output "Napravljen: $target"

