package org.animalvoices.instagram;

import android.accessibilityservice.AccessibilityService;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.graphics.PixelFormat;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import android.view.accessibility.AccessibilityWindowInfo;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;

/**
 * An opt-in, foreground-only, explicitly user-triggered helper over Instagram.
 * Never automatically reads a comment, never posts, never uses the network.
 * In-memory candidate strings are discarded when leaving Instagram.
 */
public final class VoicesService extends AccessibilityService {
    private static final String INSTAGRAM = "com.instagram.android";
    private WindowManager windows;
    private View overlay;
    private String preparedText;
    private String currentComment;
    private boolean isInstagramVisible=false;

    private boolean consent(){return getSharedPreferences(MainActivity.PREF,MODE_PRIVATE).getBoolean(MainActivity.ACCEPTED,false);}
    private int dp(int n){return (int)(getResources().getDisplayMetrics().density*n+0.5f);}
    private GradientDrawable background(int color,int corners){
        GradientDrawable drawable=new GradientDrawable();
        drawable.setColor(color);drawable.setCornerRadius(dp(corners));return drawable;
    }
    private TextView text(String s,int size,int color){
        TextView view=new TextView(this);
        view.setText(s);view.setTextSize(size);view.setTextColor(color);
        view.setLineSpacing(dp(3),1.1f);return view;
    }
    private void add(LinearLayout parent,View view,int top) {
        LinearLayout.LayoutParams lp=new LinearLayout.LayoutParams(-1,-2);
        lp.topMargin=dp(top);parent.addView(view,lp);
    }
    private Button button(String label,boolean primary){
        Button b=new Button(this);b.setAllCaps(false);b.setText(label);
        b.setTextColor(primary?Color.WHITE:Color.rgb(32,77,48));
        b.setBackground(background(primary?Color.rgb(29,80,53):Color.rgb(227,242,222),12));
        b.setPadding(dp(12),dp(8),dp(12),dp(8));
        return b;
    }
    private void removeOverlay(){
        if(overlay!=null&&windows!=null){try{windows.removeView(overlay);}catch(Exception ignored){}}
        overlay=null;
    }
    private void showOverlay(View view,boolean panel){
        removeOverlay();
        WindowManager.LayoutParams params=new WindowManager.LayoutParams(
                panel?WindowManager.LayoutParams.MATCH_PARENT:WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE|WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                PixelFormat.TRANSLUCENT);
        params.gravity=Gravity.TOP|Gravity.RIGHT;
        params.x=dp(panel?10:12);params.y=dp(panel?110:145);
        if(panel)params.width=getResources().getDisplayMetrics().widthPixels-dp(20);
        try{windows.addView(view,params);overlay=view;}catch(Exception e){overlay=null;}
    }
    private void bubble(){
        if(!isInstagramVisible||!consent()){removeOverlay();return;}
        Button b=button(preparedText==null?"♡ Mit Animal Voices antworten":"↗ Antwort einsetzen",true);
        b.setTextSize(12);b.setElevation(dp(8));
        b.setOnClickListener(v->{if(preparedText==null)showCandidates();else tryInsert();});
        showOverlay(b,false);
    }
    private LinearLayout panel(String title,String note){
        LinearLayout box=new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setPadding(dp(17),dp(14),dp(17),dp(16));
        box.setBackground(background(Color.rgb(252,255,249),20));
        box.setElevation(dp(14));
        TextView header=text(title,19,Color.rgb(25,67,40));
        header.setTypeface(null,Typeface.BOLD);
        add(box,header,0);
        if(note!=null)add(box,text(note,12,Color.rgb(100,123,105)),7);
        return box;
    }
    private void showPanel(LinearLayout layout){
        ScrollView scroll=new ScrollView(this);
        scroll.setFillViewport(false);
        scroll.addView(layout);
        scroll.setBackground(background(Color.rgb(252,255,249),20));
        scroll.setElevation(dp(12));
        // Keep part of Instagram visible below/around the panel.
        scroll.setLayoutParams(new WindowManager.LayoutParams(-1,-2));
        scroll.setVerticalScrollBarEnabled(true);
        int maxHeight=getResources().getDisplayMetrics().heightPixels-dp(185);
        scroll.setOnTouchListener((v,event)->false);
        layout.measure(View.MeasureSpec.makeMeasureSpec(getResources().getDisplayMetrics().widthPixels-dp(20),View.MeasureSpec.AT_MOST),
                View.MeasureSpec.makeMeasureSpec(maxHeight,View.MeasureSpec.AT_MOST));
        if(layout.getMeasuredHeight()>maxHeight){
            scroll.setMinimumHeight(Math.min(maxHeight,dp(250)));
            // Android will constrain the scroll view through the window height below.
        }
        removeOverlay();
        WindowManager.LayoutParams params=new WindowManager.LayoutParams(
                getResources().getDisplayMetrics().widthPixels-dp(20),
                Math.min(maxHeight,Math.max(dp(170),layout.getMeasuredHeight()+dp(20))),
                WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE|WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                PixelFormat.TRANSLUCENT);
        params.gravity=Gravity.TOP|Gravity.CENTER_HORIZONTAL;
        params.y=dp(95);
        try{windows.addView(scroll,params);overlay=scroll;}catch(Exception e){overlay=null;bubble();}
    }

    private AccessibilityNodeInfo instagramRoot(){
        if(!isInstagramVisible||!consent())return null;
        List<AccessibilityWindowInfo> appWindows=getWindows();
        if(appWindows!=null)for(AccessibilityWindowInfo w:appWindows){
            if(w.getType()!=AccessibilityWindowInfo.TYPE_APPLICATION)continue;
            AccessibilityNodeInfo n=w.getRoot();
            if(n!=null&&INSTAGRAM.contentEquals(n.getPackageName()))return n;
        }
        AccessibilityNodeInfo focused=getRootInActiveWindow();
        return focused!=null&&INSTAGRAM.contentEquals(focused.getPackageName())?focused:null;
    }
    private static boolean maybeContent(String s){
        if(s==null)return false;
        String v=s.trim();
        if(v.length()<15||v.length()>360)return false;
        String lower=v.toLowerCase(Locale.ROOT);
        return !(lower.equals("gefällt mir")||lower.equals("antworten")||lower.equals("follow")||
                 lower.equals("teilen")||lower.equals("senden")||lower.equals("kommentieren")||
                 lower.contains("zugänglichkeitsoptionen"));
    }
    private List<String> visibleTexts(){
        LinkedHashSet<String> texts=new LinkedHashSet<>();
        AccessibilityNodeInfo root=instagramRoot();
        if(root==null)return new ArrayList<>();
        ArrayDeque<AccessibilityNodeInfo> pending=new ArrayDeque<>();pending.add(root);
        int visited=0;
        while(!pending.isEmpty()&&visited++<600&&texts.size()<38){
            AccessibilityNodeInfo node=pending.removeFirst();
            if(!node.isVisibleToUser())continue;
            CharSequence chars=node.getText();
            if(chars==null||chars.length()==0)chars=node.getContentDescription();
            if(chars!=null){
                String str=chars.toString().replaceAll("\\s+"," ").trim();
                if(maybeContent(str))texts.add(str);
            }
            int children=node.getChildCount();
            for(int i=0;i<children&&pending.size()<600;i++){
                AccessibilityNodeInfo child=node.getChild(i);
                if(child!=null)pending.add(child);
            }
        }
        return new ArrayList<>(texts);
    }

    private void showCandidates(){
        if(!consent()){removeOverlay();return;}
        List<String> candidates=visibleTexts();
        LinearLayout box=panel("Mit Animal Voices antworten","Wähle genau den Kommentar aus, auf den du antworten möchtest. Andere Bildschirmtexte können ebenfalls erscheinen.");
        if(candidates.isEmpty())add(box,text("Instagram stellt gerade keine lesbaren Bildschirmtexte bereit. Öffne die Kommentaransicht, scrolle zum Kommentar und versuche es erneut. Ohne sichtbaren Text raten wir nicht.",14,Color.rgb(90,104,87)),15);
        int shown=0;
        for(String s:candidates){
            if(shown++>=18)break;
            ReplyLibrary.Card match=ReplyLibrary.find(s);
            Button option=button(s+(match==null?"\n· Kein freigegebener Antwortvorschlag":"\n· Vorschlag: "+match.title),false);
            option.setTextSize(13);option.setGravity(Gravity.LEFT|Gravity.CENTER_VERTICAL);
            option.setMaxLines(5);option.setEllipsize(android.text.TextUtils.TruncateAt.END);
            option.setOnClickListener(v->showDraft(s));
            add(box,option,8);
        }
        Button close=button("Schließen · bei Instagram bleiben",false);
        close.setOnClickListener(v->bubble());add(box,close,16);
        showPanel(box);
    }
    private void showDraft(String comment){
        currentComment=comment;
        ReplyLibrary.Card card=ReplyLibrary.find(comment);
        LinearLayout box=panel(card==null?"Noch kein sicherer Vorschlag":"Vorschlag · "+card.title,
                "Ausgewählter Text: "+comment);
        if(card==null){
            add(box,text("Dafür haben wir noch keine ausreichend genaue Quellenkarte. Kein improvisierter KI-Text, keine ungesicherte Antwort.",14,Color.rgb(104,88,63)),15);
        }else{
            TextView reply=text(card.text,16,Color.rgb(32,73,46));
            reply.setPadding(dp(12),dp(13),dp(12),dp(13));
            reply.setBackground(background(Color.rgb(235,246,229),12));
            add(box,reply,15);
            add(box,text("REDAKTIONELL GEPRÜFT · "+ReplyLibrary.REVIEW_DATE,11,Color.rgb(66,125,71)),15);
            add(box,text("Quelle: "+card.sourceName+"\n"+card.sourceUrl,12,Color.rgb(71,91,75)),8);
            add(box,text("Grenze: "+card.limitation+"\nKeine unabhängige Liveprüfung.",11,Color.rgb(121,105,81)),8);
            Button select=button("Vorschlag wählen",true);
            select.setOnClickListener(v->{preparedText=card.text;showReady();});add(box,select,15);
        }
        Button back=button("Anderen Kommentar auswählen",false);
        back.setOnClickListener(v->showCandidates());add(box,back,9);
        Button close=button("Schließen",false);close.setOnClickListener(v->bubble());add(box,close,8);
        showPanel(box);
    }
    private void showReady(){
        if(preparedText==null){bubble();return;}
        LinearLayout box=panel("Bereit zum Einfügen","Dein Entwurf ist vorgemerkt – nur auf diesem Gerät und nur bis du Instagram verlässt.");
        add(box,text(preparedText,15,Color.rgb(31,76,48)),14);
        add(box,text("1. Schließe diese Einblendung.\n2. Tippe in Instagram auf das Antwortfeld.\n3. Tippe auf „↗ Antwort einsetzen“ und bestätige.\n4. „Senden“ bleibt immer deine Entscheidung.",13,Color.rgb(91,115,96)),12);
        Button close=button("Instagram-Antwortfeld öffnen / fokussieren",true);
        close.setOnClickListener(v->bubble());add(box,close,13);
        Button copy=button("Falls das Feld nicht erkannt wird: Antwort kopieren",false);
        copy.setOnClickListener(v->copyDraft());add(box,copy,9);
        Button discard=button("Entwurf verwerfen",false);
        discard.setOnClickListener(v->{preparedText=null;currentComment=null;bubble();});add(box,discard,8);
        showPanel(box);
    }

    private void copyDraft(){
        if(preparedText==null)return;
        ClipboardManager clipboard=(ClipboardManager)getSystemService(Context.CLIPBOARD_SERVICE);
        clipboard.setPrimaryClip(ClipData.newPlainText("Animal Voices Antwort",preparedText));
        Toast.makeText(this,"Antwort kopiert. In Instagram einfügen; du veröffentlichst selbst.",Toast.LENGTH_LONG).show();
        preparedText=null;currentComment=null;bubble();
    }
    private static String context(AccessibilityNodeInfo node){
        if(node==null)return "";
        StringBuilder sb=new StringBuilder();
        if(node.getHintText()!=null)sb.append(node.getHintText()).append(' ');
        if(node.getContentDescription()!=null)sb.append(node.getContentDescription()).append(' ');
        if(node.getViewIdResourceName()!=null)sb.append(node.getViewIdResourceName());
        return sb.toString().toLowerCase(Locale.ROOT);
    }
    /** Never set text without a user-selected draft and an explicitly focused Instagram reply field. */
    private void tryInsert(){
        if(preparedText==null){bubble();return;}
        AccessibilityNodeInfo root=instagramRoot();
        AccessibilityNodeInfo focus=root==null?null:root.findFocus(AccessibilityNodeInfo.FOCUS_INPUT);
        if(focus==null||!focus.isEditable()||!INSTAGRAM.contentEquals(focus.getPackageName())){
            Toast.makeText(this,"Tippe zuerst direkt in das Instagram-Antwortfeld und danach wieder auf Animal Voices.",Toast.LENGTH_LONG).show();
            showReady();return;
        }
        String signature=context(focus);
        if(!(signature.contains("comment")||signature.contains("komment")||signature.contains("reply")||signature.contains("antwort"))){
            Toast.makeText(this,"Antwortfeld nicht eindeutig erkennbar. Nutze die Kopierfunktion – wir schreiben nicht in ein unbekanntes Feld.",Toast.LENGTH_LONG).show();
            showReady();return;
        }
        CharSequence previous=focus.getText();
        if(previous!=null&&previous.length()>0){
            Toast.makeText(this,"Im Feld steht schon Text. Wir überschreiben ihn nicht; nutze bei Bedarf Kopieren.",Toast.LENGTH_LONG).show();
            showReady();return;
        }
        Bundle args=new Bundle();args.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE,preparedText);
        boolean success=focus.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT,args);
        if(success){
            preparedText=null;currentComment=null;
            Toast.makeText(this,"Entwurf im Feld. Erst dein Tippen auf Senden veröffentlicht ihn.",Toast.LENGTH_LONG).show();
            bubble();
        }else{
            Toast.makeText(this,"Instagram hat automatisches Einfügen nicht erlaubt. Du kannst den Text kopieren.",Toast.LENGTH_LONG).show();
            showReady();
        }
    }

    @Override protected void onServiceConnected(){
        super.onServiceConnected();
        windows=(WindowManager)getSystemService(WINDOW_SERVICE);
    }
    @Override public void onAccessibilityEvent(AccessibilityEvent event){
        if(event==null||windows==null)return;
        String pkg=String.valueOf(event.getPackageName());
        if(!consent()){isInstagramVisible=false;preparedText=null;currentComment=null;removeOverlay();return;}
        if(INSTAGRAM.equals(pkg)){
            boolean first=!isInstagramVisible;
            isInstagramVisible=true;
            if(first&&overlay==null)bubble();
        }else if(event.getEventType()==AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED){
            // Keyboard windows and our own overlay do not mean Instagram was left.
            if(!pkg.contains("inputmethod")&&!pkg.contains("keyboard")&&!pkg.equals(getPackageName())
                    &&!pkg.equals("android")&&!pkg.equals("com.google.android.inputmethod.latin")){
                isInstagramVisible=false;preparedText=null;currentComment=null;removeOverlay();
            }
        }
    }
    @Override public void onInterrupt(){
        isInstagramVisible=false;preparedText=null;currentComment=null;removeOverlay();
    }
    @Override public void onDestroy(){
        preparedText=null;currentComment=null;removeOverlay();super.onDestroy();
    }
}
