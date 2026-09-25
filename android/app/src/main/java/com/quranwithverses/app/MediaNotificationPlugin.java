package com.quranwithverses.app;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "MediaNotification")
public class MediaNotificationPlugin extends Plugin {
    private static MediaNotificationPlugin instance;

    @Override
    public void load() {
        super.load();
        instance = this;
    }

    public static void onActionTriggered(String action) {
        if (instance != null) {
            JSObject ret = new JSObject();
            ret.put("action", action);
            instance.notifyListeners("onNotificationAction", ret);
        }
    }

    @PluginMethod
    public void start(PluginCall call) {
        Context context = getContext();
        String title = call.getString("title", "Quran Recitation");
        String artist = call.getString("artist", "Continuous Stream");
        boolean isPlaying = call.getBoolean("isPlaying", true);

        Intent serviceIntent = new Intent(context, MediaNotificationService.class);
        serviceIntent.setAction(MediaNotificationService.ACTION_START);
        serviceIntent.putExtra(MediaNotificationService.EXTRA_TITLE, title);
        serviceIntent.putExtra(MediaNotificationService.EXTRA_ARTIST, artist);
        serviceIntent.putExtra(MediaNotificationService.EXTRA_IS_PLAYING, isPlaying);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(serviceIntent);
        } else {
            context.startService(serviceIntent);
        }

        call.resolve();
    }

    @PluginMethod
    public void update(PluginCall call) {
        Context context = getContext();
        String title = call.getString("title", "Quran Recitation");
        String artist = call.getString("artist", "Continuous Stream");
        boolean isPlaying = call.getBoolean("isPlaying", true);

        Intent serviceIntent = new Intent(context, MediaNotificationService.class);
        serviceIntent.setAction(MediaNotificationService.ACTION_UPDATE);
        serviceIntent.putExtra(MediaNotificationService.EXTRA_TITLE, title);
        serviceIntent.putExtra(MediaNotificationService.EXTRA_ARTIST, artist);
        serviceIntent.putExtra(MediaNotificationService.EXTRA_IS_PLAYING, isPlaying);

        context.startService(serviceIntent);
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        Context context = getContext();
        Intent serviceIntent = new Intent(context, MediaNotificationService.class);
        serviceIntent.setAction(MediaNotificationService.ACTION_STOP);
        context.startService(serviceIntent);
        call.resolve();
    }
}
