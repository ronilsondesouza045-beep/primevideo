$ErrorActionPreference = "Stop"

$RepoRoot =
    Split-Path $PSScriptRoot -Parent

$AssetsDir =
    Join-Path `
        $PSScriptRoot `
        "app\src\main\assets"

$Utf8NoBom =
    New-Object System.Text.UTF8Encoding($false)

Write-Host ""
Write-Host "==============================================="
Write-Host " BUILD REACT -> ANDROID ASSETS"
Write-Host "==============================================="
Write-Host ""

if (-not (Test-Path (Join-Path $RepoRoot "package.json"))) {
    throw "package.json nao encontrado."
}

if (Test-Path $AssetsDir) {

    Remove-Item `
        $AssetsDir `
        -Recurse `
        -Force
}

New-Item `
    -ItemType Directory `
    -Path $AssetsDir `
    -Force |
    Out-Null

Push-Location $RepoRoot

try {

    & npx vite build `
        "--base=/__app__/" `
        "--outDir=$AssetsDir" `
        --emptyOutDir

    if ($LASTEXITCODE -ne 0) {
        throw "Vite build falhou."
    }
}
finally {

    Pop-Location
}

$IndexFile =
    Join-Path $AssetsDir "index.html"

if (-not (Test-Path $IndexFile)) {
    throw "index.html Android nao foi criado."
}

$IndexContent =
    Get-Content `
        $IndexFile `
        -Raw

$Bootstrap = @"
<script id="primevideo-android-bootstrap">
(function () {
    try {
        window.__PRIMEVIDEO_ANDROID__ = {
            native: true,
            embedded: true
        };

        var prefix = "/__app__/";
        var current = new URL(window.location.href);
        var requestedRoute = current.searchParams.get("__route");

        if (requestedRoute) {
            history.replaceState(
                history.state,
                "",
                requestedRoute
            );
            return;
        }

        if (window.location.pathname.indexOf(prefix) === 0) {
            history.replaceState(
                history.state,
                "",
                "/"
            );
        }

    } catch (error) {

        console.error(
            "PrimeVideo Android bootstrap:",
            error
        );
    }
})();
</script>
"@

if (
    $IndexContent -notmatch
    "primevideo-android-bootstrap"
) {

    $IndexContent =
        $IndexContent.Replace(
            "</head>",
            "$Bootstrap`r`n</head>"
        )

    [System.IO.File]::WriteAllText(
        $IndexFile,
        $IndexContent,
        $Utf8NoBom
    )
}

$Files =
    @(
        Get-ChildItem `
            $AssetsDir `
            -Recurse `
            -File
    )

$Bytes =
    (
        $Files |
        Measure-Object `
            -Property Length `
            -Sum
    ).Sum

$Size =
    [Math]::Round(
        $Bytes / 1MB,
        2
    )

Write-Host ""
Write-Host "[OK] React Android criado."
Write-Host "Arquivos: $($Files.Count)"
Write-Host "Tamanho : $Size MB"
Write-Host ""