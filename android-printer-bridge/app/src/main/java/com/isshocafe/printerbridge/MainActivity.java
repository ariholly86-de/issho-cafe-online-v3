package com.isshocafe.printerbridge;

import android.Manifest;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.view.Gravity;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.TextView;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Executors;

public class MainActivity extends Activity {
    private static final int REQ_BT = 1001, PORT = 9100;
    private static final UUID SPP = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
    private BluetoothAdapter adapter; private BluetoothSocket socket; private OutputStream out;
    private Spinner devices; private TextView status; private BridgeServer server; private final List<BluetoothDevice> bonded = new ArrayList<>();
    @Override public void onCreate(Bundle b){super.onCreate(b);buildUi();adapter=BluetoothAdapter.getDefaultAdapter();if(android.os.Build.VERSION.SDK_INT>=31&&checkSelfPermission(Manifest.permission.BLUETOOTH_CONNECT)!=PackageManager.PERMISSION_GRANTED)requestPermissions(new String[]{Manifest.permission.BLUETOOTH_CONNECT},REQ_BT);else refreshDevices();server=new BridgeServer();server.start();setStatus("Bridge aktif di 127.0.0.1:9100. Pair WP58D lalu tekan Hubungkan.");}
    private void buildUi(){LinearLayout r=new LinearLayout(this);r.setOrientation(LinearLayout.VERTICAL);r.setPadding(28,28,28,28);TextView t=new TextView(this);t.setText("ISSHO PRINTER BRIDGE");t.setTextSize(24);t.setGravity(Gravity.CENTER);r.addView(t);TextView i=new TextView(this);i.setText("Samsung Tab A9 → Bluetooth Classic/SPP → WP58D 58mm");i.setTextSize(15);r.addView(i);devices=new Spinner(this);r.addView(devices);Button ref=new Button(this);ref.setText("Refresh Perangkat Paired");ref.setOnClickListener(v->refreshDevices());r.addView(ref);Button con=new Button(this);con.setText("Hubungkan WP58D");con.setOnClickListener(v->connectSelected());r.addView(con);Button test=new Button(this);test.setText("Test Print");test.setOnClickListener(v->new Thread(()->{try{connectIfNeeded();send(testBytes());ui("✓ TEST PRINT WP58D BERHASIL");}catch(Exception e){ui("✕ Test print gagal: "+e.getMessage());}}).start());r.addView(test);Button dis=new Button(this);dis.setText("Putuskan Printer");dis.setOnClickListener(v->closePrinter());r.addView(dis);status=new TextView(this);status.setTextSize(14);status.setPadding(0,20,0,0);r.addView(status);setContentView(r);}
    private void refreshDevices(){if(adapter==null)return;if(android.os.Build.VERSION.SDK_INT>=31&&checkSelfPermission(Manifest.permission.BLUETOOTH_CONNECT)!=PackageManager.PERMISSION_GRANTED){setStatus("Izin Bluetooth diperlukan.");return;}bonded.clear();List<String> names=new ArrayList<>();for(BluetoothDevice d:adapter.getBondedDevices()){bonded.add(d);names.add((d.getName()==null?"Unknown":d.getName())+"  •  "+d.getAddress());}ArrayAdapter<String>a=new ArrayAdapter<>(this,android.R.layout.simple_spinner_dropdown_item,names.isEmpty()?java.util.Collections.singletonList("Belum ada perangkat paired"):names);devices.setAdapter(a);if(names.isEmpty())setStatus("Belum ada perangkat paired. Pair WP58D di Pengaturan Bluetooth Android.");else setStatus("Perangkat paired: "+names.size()+". Pilih WP58D.");}
    private BluetoothDevice selectedDevice(){int p=devices.getSelectedItemPosition();if(p<0||p>=bonded.size())return null;return bonded.get(p);}
    private void connectSelected(){new Thread(()->{try{connectIfNeeded();ui("✓ WP58D tersambung via Bluetooth Classic/SPP. Bridge siap menerima cetak dari Kasir.");}catch(Exception e){ui("✕ Koneksi gagal: "+e.getMessage());}}).start();}
    private synchronized void connectIfNeeded()throws Exception{if(out!=null&&socket!=null&&socket.isConnected())return;BluetoothDevice d=selectedDevice();if(d==null)throw new IOException("Pilih perangkat WP58D yang sudah paired.");closePrinter();try{socket=d.createRfcommSocketToServiceRecord(SPP);socket.connect();}catch(Exception secure){closePrinter();socket=d.createInsecureRfcommSocketToServiceRecord(SPP);socket.connect();}out=socket.getOutputStream();}
    private synchronized void send(byte[] data)throws Exception{connectIfNeeded();out.write(data);out.flush();}
    private byte[] testBytes(){ByteArrayOutputStream b=new ByteArrayOutputStream();b.write(27);b.write(64);b.write(27);b.write(97);b.write(1);b.write(27);b.write(69);b.write(1);text(b,"ISSHO CAFE\n");b.write(27);b.write(69);b.write(0);text(b,"TEST PRINT WP58D\n");text(b,"BLUETOOTH CLASSIC / SPP\n");text(b,"ESC/POS 58mm\n");text(b,"--------------------------------\n");text(b,"PRINTER SIAP\n");text(b,"Koneksi aplikasi BERHASIL\n\n\n");b.write(29);b.write(86);b.write(0);return b.toByteArray();}
    private void text(ByteArrayOutputStream b,String s){byte[]x=s.getBytes(StandardCharsets.UTF_8);b.write(x,0,x.length);}private void closePrinter(){try{if(out!=null)out.close();}catch(Exception ignored){}try{if(socket!=null)socket.close();}catch(Exception ignored){}out=null;socket=null;}private void setStatus(String s){if(status!=null)status.setText(s);}private void ui(String s){runOnUiThread(()->setStatus(s));}
    @Override public void onRequestPermissionsResult(int r,String[]p,int[]g){super.onRequestPermissionsResult(r,p,g);if(r==REQ_BT&&g.length>0&&g[0]==PackageManager.PERMISSION_GRANTED)refreshDevices();else setStatus("Izin Bluetooth ditolak. Izinkan Nearby devices untuk WP58D.");}
    @Override protected void onDestroy(){if(server!=null)server.stopServer();closePrinter();super.onDestroy();}
    private class BridgeServer extends Thread{private volatile boolean running=true;private ServerSocket ss;public void run(){try{ss=new ServerSocket(PORT,20,java.net.InetAddress.getByName("127.0.0.1"));while(running){final Socket s=ss.accept();Executors.newSingleThreadExecutor().execute(()->handle(s));}}catch(Exception ignored){}}void stopServer(){running=false;try{if(ss!=null)ss.close();}catch(Exception ignored){}}
      private void handle(Socket s){try{s.setSoTimeout(8000);InputStream in=s.getInputStream();String h=readHeaders(in);String[]first=h.split("\\r?\\n",2);String[]req=first[0].split(" ");String method=req[0],path=req[1];int len=headerInt(h,"Content-Length");byte[]body=readBody(in,len);if(method.equals("OPTIONS")){respond(s,200,"{\"ok\":true}");return;}if(path.equals("/status")&&method.equals("GET")){boolean c=socket!=null&&socket.isConnected()&&out!=null;respond(s,200,"{\"ok\":true,\"bridge\":true,\"connected\":"+c+",\"printer\":\"WP58D\",\"port\":9100}");}else if(path.equals("/connect")&&method.equals("POST")){try{connectIfNeeded();respond(s,200,"{\"ok\":true,\"connected\":true,\"printer\":\"WP58D\"}");}catch(Exception e){respond(s,500,"{\"ok\":false,\"error\":"+json(e.getMessage())+"}");}}else if(path.equals("/test")&&method.equals("POST")){try{send(testBytes());respond(s,200,"{\"ok\":true,\"printed\":true}");}catch(Exception e){respond(s,500,"{\"ok\":false,\"error\":"+json(e.getMessage())+"}");}}else if(path.equals("/print")&&method.equals("POST")){try{if(body.length==0)throw new IOException("Data cetak kosong.");send(body);respond(s,200,"{\"ok\":true,\"printed\":true,\"bytes\":"+body.length+"}");}catch(Exception e){respond(s,500,"{\"ok\":false,\"error\":"+json(e.getMessage())+"}");}}else respond(s,404,"{\"ok\":false,\"error\":\"Endpoint tidak ditemukan.\"}");}catch(Exception ignored){}finally{try{s.close();}catch(Exception ignored){}}}
      private String readHeaders(InputStream in)throws Exception{ByteArrayOutputStream b=new ByteArrayOutputStream();int state=0,x;while((x=in.read())!=-1){b.write(x);if(state==0&&x=='\r')state=1;else if(state==1&&x=='\n')state=2;else if(state==2&&x=='\r')state=3;else if(state==3&&x=='\n')break;else state=0;if(b.size()>16384)throw new IOException("Header terlalu besar");}return b.toString(StandardCharsets.ISO_8859_1.name());}
      private int headerInt(String h,String n){for(String l:h.split("\\r?\\n")){int i=l.indexOf(':');if(i>0&&l.substring(0,i).trim().equalsIgnoreCase(n))try{return Integer.parseInt(l.substring(i+1).trim());}catch(Exception ignored){}}return 0;}
      private byte[]readBody(InputStream in,int len)throws Exception{ByteArrayOutputStream b=new ByteArrayOutputStream();byte[]buf=new byte[4096];while(b.size()<len){int n=in.read(buf,0,Math.min(buf.length,len-b.size()));if(n<0)break;b.write(buf,0,n);}return b.toByteArray();}
      private void respond(Socket s,int code,String body)throws Exception{byte[]x=body.getBytes(StandardCharsets.UTF_8);String h="HTTP/1.1 "+code+" OK\r\nContent-Type: application/json; charset=utf-8\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: GET,POST,OPTIONS\r\nAccess-Control-Allow-Headers: Content-Type\r\nAccess-Control-Allow-Private-Network: true\r\nCache-Control: no-store\r\nContent-Length: "+x.length+"\r\nConnection: close\r\n\r\n";s.getOutputStream().write(h.getBytes(StandardCharsets.ISO_8859_1));s.getOutputStream().write(x);s.getOutputStream().flush();}
      private String json(String s){if(s==null)s="unknown";return "\""+s.replace("\\","\\\\").replace("\"","\\\"").replace("\n"," ").replace("\r"," ")+"\"";}}
}
