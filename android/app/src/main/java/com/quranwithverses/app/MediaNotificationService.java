package com.quranwithverses.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.media.app.NotificationCompat.MediaStyle;

public class MediaNotificationService extends Service {
    public static final String CHANNEL_ID = "quran_playback_channel";
    public static final int NOTIFICATION_ID = 1001;

    public static final String ACTION_START = "ACTION_START";
    public static final String ACTION_UPDATE = "ACTION_UPDATE";
    public static final String ACTION_STOP = "ACTION_STOP";

    public static final String ACTION_PLAY = "com.quranwithverses.app.ACTION_PLAY";
    public static final String ACTION_PAUSE = "com.quranwithverses.app.ACTION_PAUSE";
    public static final String ACTION_NEXT = "com.quranwithverses.app.ACTION_NEXT";
    public static final String ACTION_PREV = "com.quranwithverses.app.ACTION_PREV";

    public static final String EXTRA_TITLE = "EXTRA_TITLE";
    public static final String EXTRA_ARTIST = "EXTRA_ARTIST";
    public static final String EXTRA_IS_PLAYING = "EXTRA_IS_PLAYING";

    private PowerManager.WakeLock wakeLock;
    private WifiManager.WifiLock wifiLock;
    private String currentTitle = "Quran Recitation";
    private String currentArtist = "Continuous Stream";
    private boolean isPlaying = false;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();

        try {
            PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (powerManager != null) {
                wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "QuranWithVerses::MediaWakeLock");
                wakeLock.setReferenceCounted(false);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        try {
            WifiManager wifiManager = (WifiManager) getApplicationContext().getSystemService(Context.WIFI_SERVICE);
            if (wifiManager != null) {
                wifiLock = wifiManager.createWifiLock(WifiManager.WIFI_MODE_FULL_HIGH_PERF, "QuranWithVerses::MediaWifiLock");
                wifiLock.setReferenceCounted(false);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void acquireLocks() {
        try {
            if (wakeLock != null && !wakeLock.isHeld()) {
                wakeLock.acquire(12 * 60 * 60 * 1000L); // 12 hours timeout guard
            }
            if (wifiLock != null && !wifiLock.isHeld()) {
                wifiLock.acquire();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void releaseLocks() {
        try {
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
            }
            if (wifiLock != null && wifiLock.isHeld()) {
                wifiLock.release();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Quran Recitation Playback",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Audio playback controls and notifications for Quran recitations");
            channel.setShowBadge(false);
            channel.setSound(null, null);
            channel.enableVibration(false);
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) return START_NOT_STICKY;

        String action = intent.getAction();
        if (action == null) action = ACTION_UPDATE;

        if (ACTION_PLAY.equals(action)) {
            MediaNotificationPlugin.onActionTriggered("play");
            isPlaying = true;
            updateNotification();
            return START_STICKY;
        } else if (ACTION_PAUSE.equals(action)) {
            MediaNotificationPlugin.onActionTriggered("pause");
            isPlaying = false;
            updateNotification();
            return START_STICKY;
        } else if (ACTION_NEXT.equals(action)) {
            MediaNotificationPlugin.onActionTriggered("next");
            return START_STICKY;
        } else if (ACTION_PREV.equals(action)) {
            MediaNotificationPlugin.onActionTriggered("prev");
            return START_STICKY;
        } else if (ACTION_STOP.equals(action)) {
            releaseLocks();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                stopForeground(STOP_FOREGROUND_REMOVE);
            } else {
                stopForeground(true);
            }
            stopSelf();
            return START_NOT_STICKY;
        }

        // START or UPDATE
        if (intent.hasExtra(EXTRA_TITLE)) {
            String title = intent.getStringExtra(EXTRA_TITLE);
            if (title != null && !title.isEmpty()) {
                currentTitle = title;
            }
        }
        if (intent.hasExtra(EXTRA_ARTIST)) {
            String artist = intent.getStringExtra(EXTRA_ARTIST);
            if (artist != null && !artist.isEmpty()) {
                currentArtist = artist;
            }
        }
        if (intent.hasExtra(EXTRA_IS_PLAYING)) {
            isPlaying = intent.getBooleanExtra(EXTRA_IS_PLAYING, true);
        }

        if (isPlaying) {
            acquireLocks();
        } else {
            releaseLocks();
        }

        Notification notification = buildNotification();

        if (ACTION_START.equals(action)) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
                } else {
                    startForeground(NOTIFICATION_ID, notification);
                }
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        } else {
            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) {
                manager.notify(NOTIFICATION_ID, notification);
            }
        }

        return START_STICKY;
    }

    private void updateNotification() {
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) {
            manager.notify(NOTIFICATION_ID, buildNotification());
        }
    }

    private Notification buildNotification() {
        Intent contentIntent = new Intent(this, MainActivity.class);
        contentIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingContentIntent = PendingIntent.getActivity(
            this, 0, contentIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        PendingIntent prevPendingIntent = PendingIntent.getService(
            this, 1, new Intent(this, MediaNotificationService.class).setAction(ACTION_PREV),
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        PendingIntent playPausePendingIntent = PendingIntent.getService(
            this, 2, new Intent(this, MediaNotificationService.class).setAction(isPlaying ? ACTION_PAUSE : ACTION_PLAY),
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        PendingIntent nextPendingIntent = PendingIntent.getService(
            this, 3, new Intent(this, MediaNotificationService.class).setAction(ACTION_NEXT),
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        int playPauseIcon = isPlaying ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play;
        String playPauseTitle = isPlaying ? "Pause" : "Play";

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(currentTitle != null ? currentTitle : "Quran Recitation")
            .setContentText(currentArtist != null ? currentArtist : "Continuous Stream")
            .setContentIntent(pendingContentIntent)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOngoing(isPlaying)
            .setShowWhen(false)
            .setOnlyAlertOnce(true)
            .addAction(android.R.drawable.ic_media_previous, "Previous", prevPendingIntent)
            .addAction(playPauseIcon, playPauseTitle, playPausePendingIntent)
            .addAction(android.R.drawable.ic_media_next, "Next", nextPendingIntent)
            .setStyle(new MediaStyle()
                .setShowActionsInCompactView(0, 1, 2));

        return builder.build();
    }

    @Override
    public void onDestroy() {
        releaseLocks();
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
