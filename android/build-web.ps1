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
Write-Host " COMPATIBILIDADE API + LINKS EXTERNOS"
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
    'use strict';

    try {

        var PROD_ORIGIN =
            'https://primevideo-ten.vercel.app';

        window.__PRIMEVIDEO_ANDROID__ = {
            native: true,
            embedded: true,
            productionOrigin: PROD_ORIGIN
        };

        /*
         * =====================================================
         * 1. API
         * =====================================================
         *
         * O site usa:
         *
         *   fetch('/api/...')
         *
         * No Android queremos eliminar qualquer ambiguidade
         * causada pela pagina React embutida.
         *
         * Apenas /api e alterado.
         * O site original nao e modificado.
         */

        if (
            typeof window.fetch === 'function' &&
            !window.__PRIMEVIDEO_FETCH_PATCHED__
        ) {

            window.__PRIMEVIDEO_FETCH_PATCHED__ =
                true;

            var originalFetch =
                window.fetch.bind(window);

            window.fetch =
                function (input, init) {

                    try {

                        if (
                            typeof input === 'string' &&
                            input.indexOf('/api/') === 0
                        ) {

                            input =
                                PROD_ORIGIN +
                                input;
                        }

                        else if (
                            typeof Request !== 'undefined' &&
                            input instanceof Request
                        ) {

                            var requestUrl =
                                input.url;

                            try {

                                var parsedRequest =
                                    new URL(
                                        requestUrl,
                                        PROD_ORIGIN
                                    );

                                if (
                                    parsedRequest.origin ===
                                        PROD_ORIGIN &&
                                    parsedRequest.pathname.indexOf(
                                        '/api/'
                                    ) === 0
                                ) {

                                    input =
                                        new Request(
                                            PROD_ORIGIN +
                                            parsedRequest.pathname +
                                            parsedRequest.search,
                                            input
                                        );
                                }
                            }
                            catch (ignoredRequestError) {
                            }
                        }

                    }
                    catch (patchError) {

                        console.error(
                            '[PrimeVideo Android] API patch:',
                            patchError
                        );
                    }

                    return originalFetch(
                        input,
                        init
                    );
                };
        }

        /*
         * =====================================================
         * 2. SERVICE WORKER
         * =====================================================
         *
         * O site possui public/sw.js.
         *
         * No navegador ele pode continuar funcionando.
         * Dentro do APK nao precisamos dele, pois os arquivos
         * React ja estao fisicamente dentro do aplicativo.
         *
         * Isso evita cache antigo interferindo em API/login.
         */

        if (
            'serviceWorker' in navigator
        ) {

            try {

                navigator.serviceWorker
                    .getRegistrations()
                    .then(function (registrations) {

                        registrations.forEach(
                            function (registration) {

                                registration.unregister()
                                    .catch(function () {});
                            }
                        );
                    })
                    .catch(function () {});

            }
            catch (ignoredServiceWorkerCleanup) {
            }

            try {

                navigator.serviceWorker.register =
                    function () {

                        console.log(
                            '[PrimeVideo Android] Service Worker desativado no APK.'
                        );

                        return Promise.reject(
                            new Error(
                                'Service Worker disabled inside Android APK'
                            )
                        );
                    };

            }
            catch (ignoredServiceWorkerPatch) {
            }
        }

        if ('caches' in window) {

            try {

                caches.keys()
                    .then(function (names) {

                        return Promise.all(
                            names.map(
                                function (name) {
                                    return caches.delete(name);
                                }
                            )
                        );
                    })
                    .catch(function () {});

            }
            catch (ignoredCacheCleanup) {
            }
        }

        /*
         * =====================================================
         * 3. WINDOW.OPEN
         * =====================================================
         *
         * PrimeModal usa window.open.
         *
         * No navegador isso abre outra aba.
         * WebView nao trata novas janelas exatamente igual.
         *
         * Transformamos o link em navegacao normal.
         * MainActivity recebe a URL externa e abre corretamente
         * pelo Android.
         */

        if (
            typeof window.open === 'function' &&
            !window.__PRIMEVIDEO_OPEN_PATCHED__
        ) {

            window.__PRIMEVIDEO_OPEN_PATCHED__ =
                true;

            var originalOpen =
                window.open.bind(window);

            window.open =
                function (url, target, features) {

                    try {

                        if (
                            typeof url === 'string' &&
                            /^(https?:|intent:|market:)/i.test(
                                url
                            )
                        ) {

                            window.location.href =
                                url;

                            return null;
                        }

                    }
                    catch (openError) {

                        console.error(
                            '[PrimeVideo Android] window.open:',
                            openError
                        );
                    }

                    return originalOpen(
                        url,
                        target,
                        features
                    );
                };
        }

        /*
         * Links HTML target="_blank".
         */

        document.addEventListener(
            'click',

            function (event) {

                try {

                    var element =
                        event.target;

                    if (
                        !element ||
                        typeof element.closest !== 'function'
                    ) {
                        return;
                    }

                    var anchor =
                        element.closest(
                            'a[target="_blank"]'
                        );

                    if (
                        !anchor ||
                        !anchor.href
                    ) {
                        return;
                    }

                    event.preventDefault();

                    window.location.href =
                        anchor.href;

                }
                catch (anchorError) {

                    console.error(
                        '[PrimeVideo Android] external link:',
                        anchorError
                    );
                }
            },

            true
        );

        /*
         * =====================================================
         * 4. ROUTER REACT
         * =====================================================
         */

        var prefix =
            '/__app__/';

        var current =
            new URL(
                window.location.href
            );

        var requestedRoute =
            current.searchParams.get(
                '__route'
            );

        if (requestedRoute) {

            history.replaceState(
                history.state,
                '',
                requestedRoute
            );
        }

        else if (
            window.location.pathname.indexOf(
                prefix
            ) === 0
        ) {

            history.replaceState(
                history.state,
                '',
                '/'
            );
        }

        console.log(
            '[PrimeVideo Android] Bootstrap OK'
        );

    }
    catch (error) {

        console.error(
            '[PrimeVideo Android] Bootstrap fatal:',
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

$FinalIndex =
    Get-Content `
        $IndexFile `
        -Raw

$RequiredMarkers = @(
    "primevideo-android-bootstrap",
    "__PRIMEVIDEO_FETCH_PATCHED__",
    "__PRIMEVIDEO_OPEN_PATCHED__",
    "Service Worker desativado no APK",
    "https://primevideo-ten.vercel.app"
)

foreach ($Marker in $RequiredMarkers) {

    if (
        $FinalIndex -notmatch
        [regex]::Escape($Marker)
    ) {

        throw "Marker Android ausente: $Marker"
    }
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
Write-Host "[OK] /api -> backend Vercel garantido."
Write-Host "[OK] Service Worker neutralizado no APK."
Write-Host "[OK] window.open corrigido."
Write-Host "[OK] target=_blank corrigido."
Write-Host ""
Write-Host "Arquivos: $($Files.Count)"
Write-Host "Tamanho : $Size MB"
Write-Host ""