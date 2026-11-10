package org.animalvoices.instagram;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.provider.Settings;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

/** Permission + disclosure screen. Never grants itself accessibility privileges. */
public final class MainActivity extends Activity {
    public static final String PREF = "avos_permission";
    public static final String ACCEPTED = "informed_consent";

    private int dp(int value) { return (int)(getResources().getDisplayMetrics().density * value + 0.5f); }
    private GradientDrawable bg(int color, int radius) {
        GradientDrawable g = new GradientDrawable();
        g.setColor(color); g.setCornerRadius(dp(radius)); return g;
    }
    private TextView label(String value, int size, int color) {
        TextView t = new TextView(this);
        t.setText(value); t.setTextSize(size); t.setTextColor(color);
        t.setLineSpacing(dp(3),1.1f); return t;
    }
    private void add(LinearLayout parent, View view, int top) {
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(-1,-2);
        lp.topMargin=dp(top);parent.addView(view,lp);
    }

    @Override public void onCreate(Bundle bundle) {
        super.onCreate(bundle);
        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        LinearLayout content = new LinearLayout(this);
        content.setOrientation(LinearLayout.VERTICAL);
        content.setPadding(dp(23),dp(38),dp(23),dp(40));
        content.setBackgroundColor(Color.rgb(247,249,241));
        scroll.addView(content);
        setContentView(scroll);

        TextView marker=label("✳ ANIMAL VOICES · ANDROID",13,Color.rgb(71,112,77));
        marker.setTypeface(null,Typeface.BOLD);
        add(content,marker,0);

        TextView title=label("Mit Animal Voices\nantworten.",34,Color.rgb(26,68,43));
        title.setTypeface(null,Typeface.BOLD);add(content,title,20);
        add(content,label("Bleib in Instagram. Tippe auf unsere Einblendung, wähle einen sichtbaren Kommentar und prüfe den vorab redaktionell erstellten Vorschlag.",16,Color.rgb(67,92,72)),18);

        TextView steps=label("1. Instagram-Kommentare öffnen\n2. Auf „♡ Animal Voices“ tippen\n3. Den richtigen Text auswählen\n4. Antwortfeld aktivieren und Vorschlag einsetzen\n5. Selbst entscheiden, ob du sendest",15,Color.rgb(29,70,47));
        steps.setPadding(dp(16),dp(17),dp(16),dp(17));
        steps.setBackground(bg(Color.rgb(231,243,224),15));
        add(content,steps,22);

        TextView disclosure=label("WICHTIG: ANDROID-BEDIENUNGSHILFE",12,Color.rgb(41,94,52));
        disclosure.setTypeface(null,Typeface.BOLD);add(content,disclosure,24);
        add(content,label(
                "Diese Berechtigung ist weitreichend: Android könnte damit grundsätzlich Bildschirminhalte anderer Apps zugänglich machen. "+
                "Unsere Implementierung liest nur nach deinem ausdrücklichen Tippen die über Android zugänglichen Texte der Instagram-App (com.instagram.android). "+
                "Sie zeigt diese Texte nur vorübergehend, um dir eine Auswahl zu ermöglichen. "+
                "Kein Screenshot, kein Internetzugriff, keine Speicherung von Kommentaren, kein Übertragen an Server. "+
                "Nur wenn du selbst einen Vorschlag auswählst und das Instagram-Antwortfeld aktivierst, wird dein Entwurf eingefügt. "+
                "Senden wird niemals ausgelöst. Die Instagram-App kann ihre Zugänglichkeit jederzeit ändern.",
                14,Color.rgb(81,95,82)),11);

        add(content,label(
                "Nur die Themen B12, Protein, Soja/Entwaldung, Erntetode sowie Klima/Fläche haben vorab redaktionell geprüfte Quellenkarten. "+
                "Keine Live-Quellenprüfung und keine Antwort bei unsicheren Zuordnungen. "+
                "Das System kann nicht garantieren, dass Instagram alle Kommentare über Bedienungshilfen sichtbar macht.",
                13,Color.rgb(92,111,94)),13);

        CheckBox consent=new CheckBox(this);
        consent.setText("Ich verstehe den Zugriff und möchte Animal Voices bewusst für Instagram aktivieren.");
        consent.setTextSize(14);consent.setTextColor(Color.rgb(35,76,45));
        consent.setChecked(getSharedPreferences(PREF,MODE_PRIVATE).getBoolean(ACCEPTED,false));
        add(content,consent,19);

        Button settings=new Button(this);
        settings.setText("Zugriff in Android-Einstellungen aktivieren");
        settings.setAllCaps(false);
        settings.setEnabled(consent.isChecked());
        add(content,settings,14);
        consent.setOnCheckedChangeListener((view,checked)->{
            getSharedPreferences(PREF,MODE_PRIVATE).edit().putBoolean(ACCEPTED,checked).apply();
            settings.setEnabled(checked);
            if(!checked) Toast.makeText(this,"Zustimmung widerrufen. Deaktiviere den Dienst zusätzlich in den Bedienungshilfe-Einstellungen.",Toast.LENGTH_LONG).show();
        });
        settings.setOnClickListener(v->startActivity(new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)));

        Button instagram=new Button(this);
        instagram.setText("Instagram öffnen");
        instagram.setAllCaps(false);add(content,instagram,9);
        instagram.setOnClickListener(v->{
            Intent intent=getPackageManager().getLaunchIntentForPackage("com.instagram.android");
            if(intent==null)Toast.makeText(this,"Instagram-App nicht gefunden.",Toast.LENGTH_LONG).show();
            else startActivity(intent);
        });

        add(content,label("PRIVATER PROTOTYP · NOCH NICHT AUF EINEM REALEN INSTAGRAM-BILDSCHIRM VERIFIZIERT",11,Color.rgb(116,134,118)),28);
    }
}
