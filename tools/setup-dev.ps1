param(
    [string]$Source = (Join-Path $PSScriptRoot '..\..\RSv8.html')
)

$ErrorActionPreference = 'Stop'
$dev = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$src = Join-Path $dev 'src'
$jsDir = Join-Path $src 'js'
$styleDir = Join-Path $src 'styles'
$dist = Join-Path $dev 'dist'
New-Item -ItemType Directory -Force -Path $jsDir, $styleDir, $dist | Out-Null

$html = Get-Content -LiteralPath $Source -Raw -Encoding utf8
$styleMatch = [regex]::Match($html, '<style>([\s\S]*?)</style>')
$scriptMatch = [regex]::Match($html, '<script>([\s\S]*?)</script>')
if (-not $styleMatch.Success -or -not $scriptMatch.Success) {
    throw 'Izvorni HTML nema očekivane style/script blokove.'
}

$style = $styleMatch.Groups[1].Value.Trim() + "`n"
$script = $scriptMatch.Groups[1].Value.Trim() + "`n"

$sections = @(
    @{ Name = '01-core.js'; Start = $null; End = '/* rezervna' },
    @{ Name = '02-storage.js'; Start = '/* rezervna'; End = '/* meniji' },
    @{ Name = '03-shell-ui.js'; Start = '/* meniji'; End = '/* akcije' },
    @{ Name = '04-people-actions.js'; Start = '/* akcije'; End = '/* unos' },
    @{ Name = '05-input-search.js'; Start = '/* unos'; End = '/* tabela' },
    @{ Name = '06-table.js'; Start = '/* tabela'; End = '/* masovne' },
    @{ Name = '07-bulk-actions.js'; Start = '/* masovne'; End = '/* povezivanje' },
    @{ Name = '08-links.js'; Start = '/* povezivanje'; End = '/* deljenje' },
    @{ Name = '09-sharing.js'; Start = '/* deljenje'; End = '/* srodstvo' },
    @{ Name = '10-kinship-print.js'; Start = '/* srodstvo'; End = '/* fajlovi' },
    @{ Name = '11-io-bootstrap.js'; Start = '/* fajlovi */'; End = $null }
)

foreach ($section in $sections) {
    $start = if ($null -eq $section.Start) { 0 } else { $script.IndexOf($section.Start) }
    $end = if ($null -eq $section.End) { $script.Length } else { $script.IndexOf($section.End) }
    if ($start -lt 0 -or $end -lt $start) { throw "Nije pronađena granica za $($section.Name)." }
    $content = $script.Substring($start, $end - $start).Trim() + "`n"
    Set-Content -LiteralPath (Join-Path $jsDir $section.Name) -Value $content -Encoding utf8
}

Set-Content -LiteralPath (Join-Path $styleDir 'app.css') -Value $style -Encoding utf8

$beforeStyle = $html.Substring(0, $styleMatch.Index)
$between = $html.Substring($styleMatch.Index + $styleMatch.Length, $scriptMatch.Index - ($styleMatch.Index + $styleMatch.Length))
$afterScript = $html.Substring($scriptMatch.Index + $scriptMatch.Length)
$scriptTags = ($sections | ForEach-Object { '<script src="src/js/' + $_.Name + '"></script>' }) -join "`n"
$template = $beforeStyle + "<!-- DEV:STYLE -->`n<link rel=`"stylesheet`" href=`"src/styles/app.css`">`n<!-- /DEV:STYLE -->" + $between + "<!-- DEV:SCRIPTS -->`n" + $scriptTags + "`n<!-- /DEV:SCRIPTS -->" + $afterScript
Set-Content -LiteralPath (Join-Path $dev 'index.html') -Value $template -Encoding utf8

& (Join-Path $PSScriptRoot 'build.ps1')

