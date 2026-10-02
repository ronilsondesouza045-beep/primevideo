package com.ronilson.primevideo;

import android.Manifest;
import android.app.Activity;
import android.app.DownloadManager;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Message;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.PermissionRequest;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import androidx.webkit.WebViewAssetLoader;
import androidx.credentials.Credential;
import androidx.credentials.CredentialManager;
import androidx.credentials.CredentialManagerCallback;
import androidx.credentials.CustomCredential;
import androidx.credentials.GetCredentialRequest;
import androidx.credentials.GetCredentialResponse;
import androidx.credentials.exceptions.GetCredentialException;

import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption;
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential;

import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends Activity {

    private static final String WEB_HOST =
            "filmes.autos";

    private static final String WEB_ORIGIN =
            "https://filmes.autos";

    private static final String LOCAL_PREFIX =
            "/__app__/";

    private static final String LOCAL_ENTRY =
            WEB_ORIGIN +
            LOCAL_PREFIX +
            "index.html";

    private static final int FILE_CHOOSER_REQUEST =
            1001;

    private static final int WEB_PERMISSION_REQUEST =
            1002;

    private static final int STORAGE_PERMISSION_REQUEST =
            1003;

    private FrameLayout root;

    private WebView webView;

    private WebViewAssetLoader assetLoader;

    private ValueCallback<Uri[]> filePathCallback;

    private PermissionRequest pendingPermissionRequest;

    private View customView;

    private WebChromeClient.CustomViewCallback
            customViewCallback;

    private String pendingDownloadUrl;

    private String pendingDownloadUserAgent;

    private String pendingDownloadContentDisposition;

    private String pendingDownloadMimeType;

    @Override
    protected void onCreate(
            Bundle savedInstanceState
    ) {

        super.onCreate(savedInstanceState);

        root =
                new FrameLayout(this);

        root.setBackgroundColor(
                Color.BLACK
        );

        webView =
                new WebView(this);

        FrameLayout.LayoutParams params =
                new FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                );

        root.addView(
                webView,
                params
        );

        setContentView(root);

        createAssetLoader();

        configureWebView();

        // PRIMEVIDEO ANDROID UPDATE CHECKER
        new UpdateManager(this).checkForUpdate();

        if (savedInstanceState == null) {

            webView.loadUrl(
                    LOCAL_ENTRY
            );
        }

        if (savedInstanceState != null) {

            webView.restoreState(
                    savedInstanceState
            );
        }
    }

    private void createAssetLoader() {

        assetLoader =
                new WebViewAssetLoader
                        .Builder()

                        .setDomain(
                                WEB_HOST
                        )

                        .addPathHandler(
                                LOCAL_PREFIX,

                                new WebViewAssetLoader
                                        .AssetsPathHandler(
                                                this
                                        )
                        )

                        .addPathHandler(
                                "/",

                                new LocalAssetFallbackHandler()
                        )

                        .build();
    }

    private class LocalAssetFallbackHandler
            implements WebViewAssetLoader.PathHandler {

        @Override
        public WebResourceResponse handle(
                String path
        ) {

            if (path == null) {
                return null;
            }

            if (
                    path.equals("api") ||
                    path.startsWith("api/")
            ) {
                return null;
            }

            if (
                    path.startsWith("__/")
            ) {
                return null;
            }

            if (
                    path.startsWith(".well-known/")
            ) {
                return null;
            }

            try {

                InputStream stream =
                        getAssets().open(
                                path
                        );

                String mimeType =
                        URLConnection
                                .guessContentTypeFromName(
                                        path
                                );

                if (mimeType == null) {
                    mimeType = "application/octet-stream";
                }

                String encoding = null;

                if (
                        mimeType.startsWith("text/") ||
                        mimeType.contains("javascript") ||
                        mimeType.contains("json") ||
                        mimeType.contains("xml")
                ) {
                    encoding = "UTF-8";
                }

                return new WebResourceResponse(
                        mimeType,
                        encoding,
                        stream
                );

            } catch (IOException ignored) {

                return null;
            }
        }
    }

    private void configureWebView() {

        WebSettings settings =
                webView.getSettings();

        settings.setJavaScriptEnabled(
                true
        );

        settings.setDomStorageEnabled(
                true
        );

        settings.setDatabaseEnabled(
                true
        );

        settings.setLoadsImagesAutomatically(
                true
        );

        settings.setMediaPlaybackRequiresUserGesture(
                false
        );

        settings.setJavaScriptCanOpenWindowsAutomatically(
                true
        );

        settings.setSupportMultipleWindows(
                true
        );

        settings.setAllowContentAccess(
                true
        );

        settings.setAllowFileAccess(
                false
        );

        settings.setBuiltInZoomControls(
                false
        );

        settings.setDisplayZoomControls(
                false
        );

        settings.setMixedContentMode(
                WebSettings.MIXED_CONTENT_NEVER_ALLOW
        );

        settings.setCacheMode(
                WebSettings.LOAD_DEFAULT
        );

        CookieManager cookieManager =
                CookieManager.getInstance();

        cookieManager.setAcceptCookie(
                true
        );

        cookieManager.setAcceptThirdPartyCookies(
                webView,
                true
        );

        ApplicationInfo info =
                getApplicationInfo();

        if (
                (info.flags &
                ApplicationInfo.FLAG_DEBUGGABLE)
                != 0
        ) {

            WebView.setWebContentsDebuggingEnabled(
                    true
            );
        }

        webView.addJavascriptInterface(
                new PrimeAndroidBridge(),
                "PrimeVideoNative"
        );

        webView.setWebViewClient(
                new PrimeWebViewClient()
        );

        webView.setWebChromeClient(
                new PrimeWebChromeClient()
        );

        webView.setDownloadListener(
                new DownloadListener() {

                    @Override
                    public void onDownloadStart(
                            String url,
                            String userAgent,
                            String contentDisposition,
                            String mimetype,
                            long contentLength
                    ) {

                        requestDownload(
                                url,
                                userAgent,
                                contentDisposition,
                                mimetype
                        );
                    }
                }
        );
    }

    private class PrimeAndroidBridge {

        @JavascriptInterface
        public void googleSignIn(
                String serverClientId,
                String callbackName
        ) {

            if (
                    serverClientId == null ||
                    serverClientId.trim().isEmpty() ||
                    callbackName == null ||
                    !callbackName.matches(
                            "[A-Za-z0-9_]+"
                    )
            ) {
                return;
            }

            runOnUiThread(
                    () -> startGoogleSignIn(
                            serverClientId.trim(),
                            callbackName
                    )
            );
        }
    }

    private void startGoogleSignIn(
            String serverClientId,
            String callbackName
    ) {

        CredentialManager manager =
                CredentialManager.create(
                        MainActivity.this
                );

        GetSignInWithGoogleOption googleOption =
                new GetSignInWithGoogleOption.Builder(
                        serverClientId
                ).build();

        GetCredentialRequest request =
                new GetCredentialRequest.Builder()
                        .addCredentialOption(
                                googleOption
                        )
                        .build();

        manager.getCredentialAsync(
                MainActivity.this,
                request,
                null,
                command ->
                        runOnUiThread(
                                command
                        ),
                new CredentialManagerCallback<
                        GetCredentialResponse,
                        GetCredentialException
                >() {

                    @Override
                    public void onResult(
                            GetCredentialResponse result
                    ) {

                        Credential credential =
                                result.getCredential();

                        if (
                                credential instanceof
                                        CustomCredential
                        ) {

                            CustomCredential custom =
                                    (CustomCredential)
                                            credential;

                            if (
                                    GoogleIdTokenCredential
                                            .TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
                                            .equals(
                                                    custom.getType()
                                            )
                            ) {

                                try {

                                    GoogleIdTokenCredential google =
                                            GoogleIdTokenCredential
                                                    .createFrom(
                                                            custom.getData()
                                                    );

                                    deliverGoogleResult(
                                            callbackName,
                                            true,
                                            google.getIdToken(),
                                            null
                                    );

                                    return;

                                } catch (Exception ignored) {
                                }
                            }
                        }

                        deliverGoogleResult(
                                callbackName,
                                false,
                                null,
                                "Nao foi possivel ler a Conta Google."
                        );
                    }

                    @Override
                    public void onError(
                            GetCredentialException error
                    ) {

                        deliverGoogleResult(
                                callbackName,
                                false,
                                null,
                                "Login Google cancelado ou indisponivel."
                        );
                    }
                }
        );
    }

    private void deliverGoogleResult(
            String callbackName,
            boolean ok,
            String idToken,
            String error
    ) {

        if (
                callbackName == null ||
                !callbackName.matches(
                        "[A-Za-z0-9_]+"
                )
        ) {
            return;
        }

        JSONObject payload =
                new JSONObject();

        try {

            payload.put(
                    "ok",
                    ok
            );

            if (idToken != null) {
                payload.put(
                        "idToken",
                        idToken
                );
            }

            if (error != null) {
                payload.put(
                        "error",
                        error
                );
            }

        } catch (Exception ignored) {
            return;
        }

        String callbackJson =
                JSONObject.quote(
                        callbackName
                );

        String payloadJson =
                JSONObject.quote(
                        payload.toString()
                );

        String javascript =
                "(function(){" +
                "var cb=window[" +
                callbackJson +
                "];" +
                "if(typeof cb==='function'){" +
                "cb(" +
                payloadJson +
                ");" +
                "}" +
                "})();";

        runOnUiThread(
                () -> {

                    if (webView != null) {
                        webView.evaluateJavascript(
                                javascript,
                                null
                        );
                    }
                }
        );
    }
    private class PrimeWebViewClient
            extends WebViewClient {

        @Override
        public WebResourceResponse shouldInterceptRequest(
                WebView view,
                WebResourceRequest request
        ) {

            Uri uri =
                    request.getUrl();

            if (uri == null) {

                return super.shouldInterceptRequest(
                        view,
                        request
                );
            }

            String host =
                    uri.getHost();

            if (
                    host != null &&
                    host.equalsIgnoreCase(
                            WEB_HOST
                    )
            ) {

                WebResourceResponse response =
                        assetLoader.shouldInterceptRequest(
                                uri
                        );

                if (response != null) {
                    return response;
                }
            }

            return super.shouldInterceptRequest(
                    view,
                    request
            );
        }

        @Override
        public boolean shouldOverrideUrlLoading(
                WebView view,
                WebResourceRequest request
        ) {

            Uri uri =
                    request.getUrl();

            if (uri == null) {
                return false;
            }

            return handleNavigation(
                    uri
            );
        }
    }

    private boolean handleNavigation(
            Uri uri
    ) {

        String scheme =
                uri.getScheme();

        if (scheme == null) {
            return false;
        }

        if (
                scheme.equalsIgnoreCase("http") ||
                scheme.equalsIgnoreCase("https")
        ) {

            String host =
                    uri.getHost();

            if (
                    host != null &&
                    host.equalsIgnoreCase(
                            WEB_HOST
                    )
            ) {

                String path =
                        uri.getPath();

                if (path == null) {
                    path = "/";
                }

                if (
                        path.equals("/api") ||
                        path.startsWith("/api/")
                ) {

                    return false;
                }

                if (
                        path.startsWith("/__/") ||
                        path.startsWith("/.well-known/")
                ) {

                    return false;
                }

                if (
                        path.startsWith(
                                LOCAL_PREFIX
                        )
                ) {

                    return false;
                }

                String localRoute =
                        makeLocalRouteUrl(
                                uri
                        );

                webView.loadUrl(
                        localRoute
                );

                return true;
            }

            try {

                startActivity(
                        new Intent(
                                Intent.ACTION_VIEW,
                                uri
                        )
                );

            } catch (Exception ignored) {
            }

            return true;
        }

        if (
                scheme.equalsIgnoreCase(
                        "intent"
                )
        ) {

            try {

                Intent intent =
                        Intent.parseUri(
                                uri.toString(),
                                Intent.URI_INTENT_SCHEME
                        );

                startActivity(intent);

            } catch (Exception ignored) {
            }

            return true;
        }

        try {

            startActivity(
                    new Intent(
                            Intent.ACTION_VIEW,
                            uri
                    )
            );

        } catch (Exception ignored) {
        }

        return true;
    }

    private String makeLocalRouteUrl(
            Uri target
    ) {

        String path =
                target.getEncodedPath();

        if (
                path == null ||
                path.isEmpty()
        ) {

            path = "/";
        }

        StringBuilder route =
                new StringBuilder(
                        path
                );

        String query =
                target.getEncodedQuery();

        if (
                query != null &&
                !query.isEmpty()
        ) {

            route.append("?")
                    .append(query);
        }

        String fragment =
                target.getEncodedFragment();

        if (
                fragment != null &&
                !fragment.isEmpty()
        ) {

            route.append("#")
                    .append(fragment);
        }

        return LOCAL_ENTRY +
                "?__route=" +
                Uri.encode(
                        route.toString()
                );
    }

    private class PrimeWebChromeClient
            extends WebChromeClient {

        @Override
        public boolean onShowFileChooser(
                WebView webView,
                ValueCallback<Uri[]> callback,
                FileChooserParams params
        ) {

            if (
                    filePathCallback != null
            ) {

                filePathCallback
                        .onReceiveValue(
                                null
                        );
            }

            filePathCallback =
                    callback;

            Intent intent;

            try {

                intent =
                        params.createIntent();

            } catch (Exception exception) {

                intent =
                        new Intent(
                                Intent.ACTION_OPEN_DOCUMENT
                        );

                intent.addCategory(
                        Intent.CATEGORY_OPENABLE
                );

                intent.setType(
                        "*/*"
                );
            }

            try {

                startActivityForResult(
                        intent,
                        FILE_CHOOSER_REQUEST
                );

                return true;

            } catch (
                    ActivityNotFoundException exception
            ) {

                filePathCallback =
                        null;

                Toast.makeText(
                        MainActivity.this,
                        "Nenhum seletor de arquivos encontrado.",
                        Toast.LENGTH_LONG
                ).show();

                return false;
            }
        }

        @Override
        public void onPermissionRequest(
                final PermissionRequest request
        ) {

            runOnUiThread(
                    new Runnable() {

                        @Override
                        public void run() {

                            List<String> permissions =
                                    new ArrayList<>();

                            for (
                                    String resource :
                                    request.getResources()
                            ) {

                                if (
                                        PermissionRequest
                                                .RESOURCE_VIDEO_CAPTURE
                                                .equals(resource)
                                ) {

                                    if (
                                            checkSelfPermission(
                                                    Manifest.permission.CAMERA
                                            )
                                            !=
                                            PackageManager.PERMISSION_GRANTED
                                    ) {

                                        permissions.add(
                                                Manifest.permission.CAMERA
                                        );
                                    }
                                }

                                if (
                                        PermissionRequest
                                                .RESOURCE_AUDIO_CAPTURE
                                                .equals(resource)
                                ) {

                                    if (
                                            checkSelfPermission(
                                                    Manifest.permission.RECORD_AUDIO
                                            )
                                            !=
                                            PackageManager.PERMISSION_GRANTED
                                    ) {

                                        permissions.add(
                                                Manifest.permission.RECORD_AUDIO
                                        );
                                    }
                                }
                            }

                            if (
                                    permissions.isEmpty()
                            ) {

                                request.grant(
                                        request.getResources()
                                );

                                return;
                            }

                            pendingPermissionRequest =
                                    request;

                            requestPermissions(
                                    permissions.toArray(
                                            new String[0]
                                    ),
                                    WEB_PERMISSION_REQUEST
                            );
                        }
                    }
            );
        }

        @Override
        public boolean onCreateWindow(
                WebView view,
                boolean isDialog,
                boolean isUserGesture,
                Message resultMsg
        ) {

            WebView popup =
                    new WebView(
                            MainActivity.this
                    );

            popup.getSettings()
                    .setJavaScriptEnabled(
                            true
                    );

            popup.getSettings()
                    .setDomStorageEnabled(
                            true
                    );

            popup.setWebViewClient(
                    new WebViewClient() {

                        @Override
                        public boolean shouldOverrideUrlLoading(
                                WebView popupView,
                                WebResourceRequest request
                        ) {

                            Uri uri =
                                    request.getUrl();

                            if (uri == null) {

                                popup.destroy();

                                return true;
                            }

                            String host =
                                    uri.getHost();

                            if (
                                    host != null &&
                                    host.equalsIgnoreCase(
                                            WEB_HOST
                                    )
                            ) {

                                String path =
                                        uri.getPath();

                                if (
                                        path != null &&
                                        (
                                            path.startsWith("/__/") ||
                                            path.startsWith("/.well-known/")
                                        )
                                ) {

                                    return false;
                                }

                                webView.loadUrl(
                                        makeLocalRouteUrl(
                                                uri
                                        )
                                );

                                popup.destroy();

                                return true;
                            }

                            try {

                                startActivity(
                                        new Intent(
                                                Intent.ACTION_VIEW,
                                                uri
                                        )
                                );

                            } catch (Exception ignored) {
                            }

                            popup.destroy();

                            return true;
                        }
                    }
            );

            WebView.WebViewTransport transport =
                    (WebView.WebViewTransport)
                            resultMsg.obj;

            transport.setWebView(
                    popup
            );

            resultMsg.sendToTarget();

            return true;
        }

        @Override
        public void onShowCustomView(
                View view,
                CustomViewCallback callback
        ) {

            if (
                    customView != null
            ) {

                callback.onCustomViewHidden();

                return;
            }

            customView =
                    view;

            customViewCallback =
                    callback;

            webView.setVisibility(
                    View.GONE
            );

            root.addView(
                    customView,

                    new FrameLayout.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.MATCH_PARENT
                    )
            );

            getWindow()
                    .getDecorView()
                    .setSystemUiVisibility(
                            View.SYSTEM_UI_FLAG_FULLSCREEN
                            |
                            View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                            |
                            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    );
        }

        @Override
        public void onHideCustomView() {

            hideCustomView();
        }
    }

    private void hideCustomView() {

        if (
                customView == null
        ) {
            return;
        }

        root.removeView(
                customView
        );

        customView =
                null;

        webView.setVisibility(
                View.VISIBLE
        );

        getWindow()
                .getDecorView()
                .setSystemUiVisibility(
                        View.SYSTEM_UI_FLAG_VISIBLE
                );

        if (
                customViewCallback != null
        ) {

            customViewCallback
                    .onCustomViewHidden();

            customViewCallback =
                    null;
        }
    }

    private void requestDownload(
            String url,
            String userAgent,
            String contentDisposition,
            String mimeType
    ) {

        if (
                url == null ||
                !(
                    url.startsWith("https://") ||
                    url.startsWith("http://")
                )
        ) {

            Toast.makeText(
                    this,
                    "Esse download precisa de tratamento especial.",
                    Toast.LENGTH_LONG
            ).show();

            return;
        }

        if (
                Build.VERSION.SDK_INT <= 28 &&
                checkSelfPermission(
                        Manifest.permission.WRITE_EXTERNAL_STORAGE
                )
                !=
                PackageManager.PERMISSION_GRANTED
        ) {

            pendingDownloadUrl =
                    url;

            pendingDownloadUserAgent =
                    userAgent;

            pendingDownloadContentDisposition =
                    contentDisposition;

            pendingDownloadMimeType =
                    mimeType;

            requestPermissions(
                    new String[]{
                            Manifest.permission.WRITE_EXTERNAL_STORAGE
                    },
                    STORAGE_PERMISSION_REQUEST
            );

            return;
        }

        startDownload(
                url,
                userAgent,
                contentDisposition,
                mimeType
        );
    }

    private void startDownload(
            String url,
            String userAgent,
            String contentDisposition,
            String mimeType
    ) {

        try {

            String fileName =
                    URLUtil.guessFileName(
                            url,
                            contentDisposition,
                            mimeType
                    );

            DownloadManager.Request request =
                    new DownloadManager.Request(
                            Uri.parse(
                                    url
                            )
                    );

            request.setTitle(
                    fileName
            );

            request.setDescription(
                    "Baixando arquivo..."
            );

            if (
                    mimeType != null
            ) {

                request.setMimeType(
                        mimeType
                );
            }

            if (
                    userAgent != null
            ) {

                request.addRequestHeader(
                        "User-Agent",
                        userAgent
                );
            }

            String cookies =
                    CookieManager
                            .getInstance()
                            .getCookie(
                                    url
                            );

            if (
                    cookies != null
            ) {

                request.addRequestHeader(
                        "Cookie",
                        cookies
                );
            }

            request.setNotificationVisibility(
                    DownloadManager
                            .Request
                            .VISIBILITY_VISIBLE_NOTIFY_COMPLETED
            );

            request.setDestinationInExternalPublicDir(
                    Environment.DIRECTORY_DOWNLOADS,
                    fileName
            );

            DownloadManager manager =
                    (DownloadManager)
                            getSystemService(
                                    Context.DOWNLOAD_SERVICE
                            );

            manager.enqueue(
                    request
            );

            Toast.makeText(
                    this,
                    "Download iniciado.",
                    Toast.LENGTH_SHORT
            ).show();

        } catch (Exception exception) {

            Toast.makeText(
                    this,
                    "Nao foi possivel iniciar o download.",
                    Toast.LENGTH_LONG
            ).show();
        }
    }

    @Override
    protected void onActivityResult(
            int requestCode,
            int resultCode,
            Intent data
    ) {

        super.onActivityResult(
                requestCode,
                resultCode,
                data
        );

        if (
                requestCode !=
                FILE_CHOOSER_REQUEST
        ) {
            return;
        }

        if (
                filePathCallback == null
        ) {
            return;
        }

        Uri[] results =
                null;

        if (
                resultCode ==
                Activity.RESULT_OK
        ) {

            if (
                    data != null &&
                    data.getData() != null
            ) {

                results =
                        new Uri[]{
                                data.getData()
                        };
            }
        }

        filePathCallback
                .onReceiveValue(
                        results
                );

        filePathCallback =
                null;
    }

    @Override
    public void onRequestPermissionsResult(
            int requestCode,
            String[] permissions,
            int[] grantResults
    ) {

        super.onRequestPermissionsResult(
                requestCode,
                permissions,
                grantResults
        );

        if (
                requestCode ==
                WEB_PERMISSION_REQUEST
        ) {

            boolean allGranted =
                    true;

            for (
                    int result :
                    grantResults
            ) {

                if (
                        result !=
                        PackageManager.PERMISSION_GRANTED
                ) {

                    allGranted =
                            false;

                    break;
                }
            }

            if (
                    pendingPermissionRequest != null
            ) {

                if (allGranted) {

                    pendingPermissionRequest
                            .grant(
                                    pendingPermissionRequest
                                            .getResources()
                            );
                }

                if (!allGranted) {

                    pendingPermissionRequest
                            .deny();
                }

                pendingPermissionRequest =
                        null;
            }
        }

        if (
                requestCode ==
                STORAGE_PERMISSION_REQUEST
        ) {

            if (
                    grantResults.length > 0 &&
                    grantResults[0] ==
                    PackageManager.PERMISSION_GRANTED
            ) {

                if (
                        pendingDownloadUrl != null
                ) {

                    startDownload(
                            pendingDownloadUrl,
                            pendingDownloadUserAgent,
                            pendingDownloadContentDisposition,
                            pendingDownloadMimeType
                    );
                }
            }

            pendingDownloadUrl =
                    null;

            pendingDownloadUserAgent =
                    null;

            pendingDownloadContentDisposition =
                    null;

            pendingDownloadMimeType =
                    null;
        }
    }

    @Override
    public void onBackPressed() {

        if (
                customView != null
        ) {

            hideCustomView();

            return;
        }

        if (
                webView != null &&
                webView.canGoBack()
        ) {

            webView.goBack();

            return;
        }

        super.onBackPressed();
    }

    @Override
    protected void onSaveInstanceState(
            Bundle outState
    ) {

        if (
                webView != null
        ) {

            webView.saveState(
                    outState
            );
        }

        super.onSaveInstanceState(
                outState
        );
    }

    @Override
    protected void onPause() {

        if (
                webView != null
        ) {

            webView.onPause();
            webView.pauseTimers();
        }

        super.onPause();
    }

    @Override
    protected void onResume() {

        super.onResume();

        if (
                webView != null
        ) {

            webView.onResume();
            webView.resumeTimers();
        }
    }

    @Override
    protected void onDestroy() {

        if (
                webView != null
        ) {

            root.removeView(
                    webView
            );

            webView.removeAllViews();

            webView.destroy();

            webView =
                    null;
        }

        super.onDestroy();
    }
}