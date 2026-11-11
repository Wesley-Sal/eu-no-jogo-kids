package br.com.eunojogo.kids;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.core.content.FileProvider;

import java.io.File;

/** App Android: mostra o jogo (HTML em assets/www) numa WebView e abre câmera/galeria para as fotos. */
public class MainActivity extends Activity {
    private static final int REQ_FOTO = 42;
    private WebView web;
    private ValueCallback<Uri[]> fileCallback;
    private Uri cameraUri;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // perfis, fotos e desenhos ficam salvos no celular
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setTextZoom(100);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri u = request.getUrl();
                if ("file".equals(u.getScheme())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
                return true;
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;

                Intent galeria = new Intent(Intent.ACTION_GET_CONTENT);
                galeria.addCategory(Intent.CATEGORY_OPENABLE);
                galeria.setType("image/*");

                Intent camera = null;
                try {
                    File pasta = new File(getCacheDir(), "fotos");
                    pasta.mkdirs();
                    File foto = File.createTempFile("foto", ".jpg", pasta);
                    cameraUri = FileProvider.getUriForFile(MainActivity.this, getPackageName() + ".fotos", foto);
                    camera = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                    camera.putExtra(MediaStore.EXTRA_OUTPUT, cameraUri);
                    camera.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
                } catch (Exception e) {
                    cameraUri = null;
                }

                Intent abrir;
                if (params.isCaptureEnabled() && camera != null) {
                    abrir = camera;
                } else {
                    abrir = Intent.createChooser(galeria, "Escolher foto");
                    if (camera != null) abrir.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[]{camera});
                }
                try {
                    startActivityForResult(abrir, REQ_FOTO);
                } catch (Exception e) {
                    fileCallback = null;
                    return false;
                }
                return true;
            }
        });

        if (state != null) web.restoreState(state);
        else web.loadUrl("file:///android_asset/www/index.html");
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != REQ_FOTO || fileCallback == null) return;
        Uri[] resultado = null;
        if (resultCode == RESULT_OK) {
            if (data != null && data.getData() != null) resultado = new Uri[]{data.getData()};
            else if (cameraUri != null) resultado = new Uri[]{cameraUri};
        }
        fileCallback.onReceiveValue(resultado);
        fileCallback = null;
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }
}
