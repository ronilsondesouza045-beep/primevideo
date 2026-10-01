package com.ronilson.primevideo;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class UpdateManager {

    private static final String TAG =
            "PrimeVideoUpdate";

    private static final String VERSION_URL =
            "https://primevideo-ten.vercel.app/android-version.json";

    private final Activity activity;

    public UpdateManager(Activity activity) {
        this.activity = activity;
    }

    public void checkForUpdate() {

        new Thread(
                new Runnable() {

                    @Override
                    public void run() {

                        checkRemoteVersion();
                    }
                }
        ).start();
    }

    private void checkRemoteVersion() {

        HttpURLConnection connection = null;

        try {

            long timestamp =
                    System.currentTimeMillis();

            URL url =
                    new URL(
                            VERSION_URL +
                            "?t=" +
                            timestamp
                    );

            connection =
                    (HttpURLConnection)
                            url.openConnection();

            connection.setRequestMethod(
                    "GET"
            );

            connection.setConnectTimeout(
                    8000
            );

            connection.setReadTimeout(
                    8000
            );

            connection.setUseCaches(
                    false
            );

            connection.setRequestProperty(
                    "Accept",
                    "application/json"
            );

            connection.setRequestProperty(
                    "Cache-Control",
                    "no-cache"
            );

            int responseCode =
                    connection.getResponseCode();

            if (responseCode != 200) {

                Log.w(
                        TAG,
                        "Version endpoint HTTP " +
                                responseCode
                );

                return;
            }

            BufferedReader reader =
                    new BufferedReader(
                            new InputStreamReader(
                                    connection.getInputStream()
                            )
                    );

            StringBuilder response =
                    new StringBuilder();

            String line;

            while (
                    (line = reader.readLine())
                    != null
            ) {

                response.append(
                        line
                );
            }

            reader.close();

            JSONObject json =
                    new JSONObject(
                            response.toString()
                    );

            long remoteVersionCode =
                    json.optLong(
                            "versionCode",
                            0
                    );

            long minimumVersionCode =
                    json.optLong(
                            "minVersionCode",
                            0
                    );

            String remoteVersionName =
                    json.optString(
                            "versionName",
                            ""
                    );

            String title =
                    json.optString(
                            "title",
                            "Nova versao disponivel"
                    );

            String message =
                    json.optString(
                            "message",
                            "Existe uma nova versao do aplicativo."
                    );

            String downloadUrl =
                    json.optString(
                            "downloadUrl",
                            ""
                    );

            boolean explicitRequired =
                    json.optBoolean(
                            "required",
                            false
                    );

            JSONArray changes =
                    json.optJSONArray(
                            "changes"
                    );

            long currentVersionCode =
                    getCurrentVersionCode();

            if (
                    remoteVersionCode <=
                    currentVersionCode
            ) {

                Log.d(
                        TAG,
                        "Aplicativo atualizado. Local=" +
                                currentVersionCode +
                                " remoto=" +
                                remoteVersionCode
                );

                return;
            }

            boolean required =
                    explicitRequired ||
                    currentVersionCode <
                            minimumVersionCode;

            String changesText =
                    buildChangesText(
                            changes
                    );

            final String dialogTitle =
                    title;

            final String dialogDownloadUrl =
                    downloadUrl;

            final boolean dialogRequired =
                    required;

            final String dialogMessage =
                    buildDialogMessage(
                            message,
                            remoteVersionName,
                            changesText,
                            required
                    );

            activity.runOnUiThread(
                    new Runnable() {

                        @Override
                        public void run() {

                            showUpdateDialog(
                                    dialogTitle,
                                    dialogMessage,
                                    dialogDownloadUrl,
                                    dialogRequired
                            );
                        }
                    }
            );

        } catch (Exception exception) {

            Log.w(
                    TAG,
                    "Nao foi possivel verificar atualizacao.",
                    exception
            );
        }

        if (connection != null) {

            connection.disconnect();
        }
    }

    private long getCurrentVersionCode()
            throws Exception {

        PackageInfo info =
                activity
                        .getPackageManager()
                        .getPackageInfo(
                                activity.getPackageName(),
                                0
                        );

        if (
                Build.VERSION.SDK_INT >=
                Build.VERSION_CODES.P
        ) {

            return info.getLongVersionCode();
        }

        return info.versionCode;
    }

    private String buildChangesText(
            JSONArray changes
    ) {

        if (
                changes == null ||
                changes.length() == 0
        ) {

            return "";
        }

        StringBuilder text =
                new StringBuilder();

        for (
                int i = 0;
                i < changes.length();
                i++
        ) {

            String change =
                    changes.optString(
                            i,
                            ""
                    );

            if (
                    change == null ||
                    change.trim().isEmpty()
            ) {

                continue;
            }

            text.append("• ")
                    .append(change.trim())
                    .append("\n");
        }

        return text.toString().trim();
    }

    private String buildDialogMessage(
            String message,
            String versionName,
            String changes,
            boolean required
    ) {

        StringBuilder text =
                new StringBuilder();

        if (
                versionName != null &&
                !versionName.isEmpty()
        ) {

            text.append("Versao ")
                    .append(versionName)
                    .append("\n\n");
        }

        if (
                message != null &&
                !message.isEmpty()
        ) {

            text.append(message)
                    .append("\n");
        }

        if (
                changes != null &&
                !changes.isEmpty()
        ) {

            text.append("\nO que mudou:\n")
                    .append(changes);
        }

        if (required) {

            text.append(
                    "\n\nEsta atualizacao e necessaria para continuar usando esta versao do aplicativo."
            );
        }

        return text.toString();
    }

    private void showUpdateDialog(
            String title,
            String message,
            final String downloadUrl,
            boolean required
    ) {

        AlertDialog.Builder builder =
                new AlertDialog.Builder(
                        activity
                );

        builder.setTitle(
                title
        );

        builder.setMessage(
                message
        );

        builder.setPositiveButton(
                "Atualizar agora",

                new DialogInterface.OnClickListener() {

                    @Override
                    public void onClick(
                            DialogInterface dialog,
                            int which
                    ) {

                        openUpdateUrl(
                                downloadUrl
                        );
                    }
                }
        );

        if (!required) {

            builder.setNegativeButton(
                    "Agora nao",

                    new DialogInterface.OnClickListener() {

                        @Override
                        public void onClick(
                                DialogInterface dialog,
                                int which
                        ) {

                            dialog.dismiss();
                        }
                    }
            );

            builder.setCancelable(
                    true
            );
        }

        if (required) {

            builder.setCancelable(
                    false
            );
        }

        AlertDialog dialog =
                builder.create();

        dialog.show();
    }

    private void openUpdateUrl(
            String downloadUrl
    ) {

        if (
                downloadUrl == null ||
                downloadUrl.trim().isEmpty()
        ) {

            return;
        }

        try {

            Intent intent =
                    new Intent(
                            Intent.ACTION_VIEW,
                            Uri.parse(
                                    downloadUrl
                            )
                    );

            activity.startActivity(
                    intent
            );

        } catch (Exception exception) {

            Log.e(
                    TAG,
                    "Falha ao abrir download.",
                    exception
            );
        }
    }
}