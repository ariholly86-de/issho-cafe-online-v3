package com.isshocafe.printerbridge;

import android.Manifest;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Bundle;
import android.view.ViewGroup;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.LinearLayout;
import android.widget.TextView;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.concurrent.Executors;

public class MainActivity extends Activity {
    private static final int REQ_BT=1001, PORT=9100;
    private static final String PRINTER_NAME="RPP02N";
    private static final UUID SPP=UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
    private static final String DAPUR_URL="https://issho-cafe-online-v3.vercel.app/dapur-v8.html?v=20260904-single-link";
    private BluetoothAdapter adapter; private BluetoothSocket socket; private OutputStream out; private BridgeServer server; private WebView web; private TextView nativeStatus;
    @Override public void onCreate(Bundle b){super.onCreate(b);adapter=BluetoothAdapter.getDefaultAdapter();buildApp();server=new BridgeServer();server.start();if(android.os.Build.VERSION.SDK_INT>=31&&checkSelfPermission(Manifest.permission.BLUETOOTH_CONNECT)!=PackageManager.PERMISSION_GRANTED)requestPermissions(new String[]{Manifest.permission.BLUETOOTH_CONNECT},REQ_BT);else startPrinterAutoConnect();}
    private void buildApp(){LinearLayout root=new LinearLayout(this);root.setOrientation(LinearLayout.VERTICAL);root.setBackgroundColor(Color.BLACK);nativeStatus=new TextView(this);nativeStatus.setText("ISSHO CAFE • Dapur + Printer RPP02N: memeriksa koneksi…");nativeStatus.setTextColor(Color.WHITE);nativeStatus.setTextSize(13);nativeStatus.setPadding(16,12,16,12);root.addView(nativeStatus,new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,ViewGroup.LayoutParams.WRAP_CONTENT));web=new WebView(this);WebSettings s=web.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setDatabaseEnabled(true);s.setAllowFileAccess(false);s.setMediaPlaybackRequiresUserGesture(false);if(android.os.Build.VERSION.SDK_INT>=21)s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);web.setWebViewClient(new WebViewClient());web.setWebChromeClient(new WebChromeClient());web.setOverScrollMode(WebView.OVER_SCROLL_NEVER);web.loadUrl(DAPUR_URL);root.addView(web,new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,0,1f));setContentView(root);}
    private void startPrinterAutoConnect(){new Thread(()->{try{Thread.sleep(500);connectIfNeeded();ui("✓ RPP02N tersambung otomatis • Dapur siap cetak");}catch(Exception e){ui("RPP02N belum tersambung. Pastikan printer ON dan sudah Pair di Bluetooth Android.");}}).start();}
    private BluetoothDevice findPrinter()throws Exception{if(adapter==null)throw new IOException("Tablet tidak mendukung Bluetooth.");if(android.os.Build.VERSION.SDK_INT>=31&&checkSelfPermission(Manifest.permission.BLUETOOTH_CONNECT)!=PackageManager.PERMISSION_GRANTED)throw new IOException("Izin Bluetooth belum diberikan.");BluetoothDevice exact=null,fallback=null;for(BluetoothDevice d:adapter.getBondedDevices()){String name=d.getName();if(name==null)continue;if(PRINTER_NAME.equalsIgnoreCase(name.trim()))exact=d;else if(name.toUpperCase().contains("RPP02N"))fallback=d;}if(exact!=null)return exact;if(fallback!=null)return fallback;throw new IOException("Printer Bluetooth RPP02N belum di-pair. Pair RPP02N di Pengaturan Bluetooth Android terlebih dahulu.");}
    private synchronized void connectIfNeeded()throws Exception{if(out!=null&&socket!=null&&socket.isConnected())return;BluetoothDevice d=findPrinter();closePrinter();try{socket=d.createRfcommSocketToServiceRecord(SPP);socket.connect();}catch(Exception secure){closePrinter();socket=d.createInsecureRfcommSocketToServiceRecord(SPP);socket.connect();}out=socket.getOutputStream();}
    private synchronized void send(byte[]data)throws Exception{connectIfNeeded();out.write(data);out.flush();}
    private byte[]testBytes(){ByteArrayOutputStream b=new ByteArrayOutputStream();b.write(27);b.write(64);b.write(27);b.write(97);b.write(1);b.write(27);b.write(69);b.write(1);text(b,"ISSHO CAFE\n");b.write(27);b.write(69);b.write(0);text(b,"TEST PRINT RPP02N\n");text(b,"BLUETOOTH CLASSIC / SPP\n");text(b,"ESC/POS 58mm\n");text(b,"--------------------------------\n");text(b,"PRINTER SIAP\n");text(b,"Koneksi Dapur BERHASIL\n\n\n");b.write(29);b.write(86);b.write(0);return b.toByteArray();}
    private void text(ByteArrayOutputStream b,String s){byte[]x=s.getBytes(StandardCharsets.UTF_8);b.write(x,0,x.length);}private synchronized void closePrinter(){try{if(out!=null)out.close();}catch(Exception ignored){}try{if(socket!=null)socket.close();}catch(Exception ignored){}out=null;socket=null;}private void ui(String s){runOnUiThread(()->{if(nativeStatus!=null)nativeStatus.setText(s);});}
    @Override public void onNewIntent(Intent intent){super.onNewIntent(intent);setIntent(intent);if(web!=null&&!web.getUrl().equals(DAPUR_URL))web.loadUrl(DAPUR_URL);}
    @Override public void onRequestPermissionsResult(int r,String[]p,int[]g){super.onRequestPermissionsResult(r,p,g);if(r==REQ_BT&&g.length>0&&g[0]==PackageManager.PERMISSION_GRANTED)startPrinterAutoConnect();else ui("Izin Nearby devices diperlukan untuk printer RPP02N.");}
    @Override public void onBackPressed(){if(web!=null&&web.canGoBack())web.goBack();else super.onBackPressed();}@Override protected void onDestroy(){if(server!=null)server.stopServer();closePrinter();if(web!=null)web.destroy();super.onDestroy();}
    private class BridgeServer extends Thread{private volatile boolean running=true;private ServerSocket ss;public void run(){try{ss=new ServerSocket(PORT,20,java.net.InetAddress.getByName("127.0.0.1"));while(running){final Socket s=ss.accept();Executors.newSingleThreadExecutor().execute(()->handle(s));}}catch(Exception ignored){}}void stopServer(){running=false;try{if(ss!=null)ss.close();}catch(Exception ignored){}}
        private void handle(Socket s){try{s.setSoTimeout(8000);InputStream in=s.getInputStream();String h=readHeaders(in);String[]first=h.split("\\r?\\n",2);String[]req=first[0].split(" ");String method=req[0],path=req[1];int len=headerInt(h,"Content-Length");byte[]body=readBody(in,len);if(method.equals("OPTIONS")){respond(s,200,"{\"ok\":true}");return;}if(path.equals("/status")&&method.equals("GET")){boolean c=socket!=null&&socket.isConnected()&&out!=null;respond(s,200,"{\"ok\":true,\"bridge\":true,\"connected\":"+c+",\"printer\":\"RPP02N\",\"model\":\"58mm Thermal\",\"port\":9100}");}else if(path.equals("/connect")&&method.equals("POST")){try{connectIfNeeded();ui("✓ RPP02N tersambung • Dapur siap cetak");respond(s,200,"{\"ok\":true,\"connected\":true,\"printer\":\"RPP02N\"}");}catch(Exception e){respond(s,500,"{\"ok\":false,\"error\":"+json(e.getMessage())+"}");}}else if(path.equals("/test")&&method.equals("POST")){try{send(testBytes());ui("✓ Test print RPP02N berhasil");respond(s,200,"{\"ok\":true,\"printed\":true}");}catch(Exception e){respond(s,500,"{\"ok\":false,\"error\":"+json(e.getMessage())+"}");}}else if(path.equals("/print")&&method.equals("POST")){try{if(body.length==0)throw new IOException("Data cetak kosong.");send(body);respond(s,200,"{\"ok\":true,\"printed\":true,\"bytes\":"+body.length+"}");}catch(Exception e){respond(s,500,"{\"ok\":false,\"error\":"+json(e.getMessage())+"}");}}else respond(s,404,"{\"ok\":false,\"error\":\"Endpoint tidak ditemukan.\"}");}catch(Exception ignored){}finally{try{s.close();}catch(Exception ignored){}}}
        private String readHeaders(InputStream in)throws Exception{ByteArrayOutputStream b=new ByteArrayOutputStream();int state=0,x;while((x=in.read())!=-1){b.write(x);if(state==0&&x=='\r')state=1;else if(state==1&&x=='\n')state=2;else if(state==2&&x=='\r')state=3;else if(state==3&&x=='\n')break;else state=0;if(b.size()>16384)throw new IOException("Header terlalu besar");}return b.toString(StandardCharsets.ISO_8859_1.name());}private int headerInt(String h,String n){for(String l:h.split("\\r?\\n")){int i=l.indexOf(':');if(i>0&&l.substring(0,i).trim().equalsIgnoreCase(n))try{return Integer.parseInt(l.substring(i+1).trim());}catch(Exception ignored){}}return 0;}private byte[]readBody(InputStream in,int len)throws Exception{ByteArrayOutputStream b=new ByteArrayOutputStream();byte[]buf=new byte[4096];while(b.size()<len){int n=in.read(buf,0,Math.min(buf.length,len-b.size()));if(n<0)break;b.write(buf,0,n);}return b.toByteArray();}private void respond(Socket s,int code,String body)throws Exception{byte[]x=body.getBytes(StandardCharsets.UTF_8);String h="HTTP/1.1 "+code+" OK\r\nContent-Type: application/json; charset=utf-8\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: GET,POST,OPTIONS\r\nAccess-Control-Allow-Headers: Content-Type\r\nAccess-Control-Allow-Private-Network: true\r\nCache-Control: no-store\r\nContent-Length: "+x.length+"\r\nConnection: close\r\n\r\n";s.getOutputStream().write(h.getBytes(StandardCharsets.ISO_8859_1));s.getOutputStream().write(x);s.getOutputStream().flush();}private String json(String s){if(s==null)s="unknown";return "\""+s.replace("\\","\\\\").replace("\"","\\\"").replace("\n"," ").replace("\r"," ")+"\"";}}
}
