package com.isshocafe.printerbridge;

import android.Manifest;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import java.io.OutputStream;
import java.util.UUID;

public class MainActivity extends Activity {
    static final UUID SPP = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
    TextView status; BridgeServer server;
    @Override public void onCreate(Bundle b){ super.onCreate(b); status=new TextView(this); status.setPadding(28,28,28,28); status.setTextSize(17); Button start=new Button(this); start.setText("Mulai Printer Bridge"); Button test=new Button(this); test.setText("Test Print WP58D"); LinearLayout l=new LinearLayout(this); l.setOrientation(LinearLayout.VERTICAL); l.addView(status); l.addView(start); l.addView(test); setContentView(l); start.setOnClickListener(v->startBridge()); test.setOnClickListener(v->new Thread(()->{ try{ Printer.connect(this,"WP58D"); Printer.test(); runOnUiThread(()->status.setText("✓ Test print dikirim ke WP58D")); }catch(Exception e){runOnUiThread(()->status.setText("Gagal: "+e.getMessage()));}}).start()); requestBt(); startBridge(); }
    void requestBt(){ if(android.os.Build.VERSION.SDK_INT>=31 && checkSelfPermission(Manifest.permission.BLUETOOTH_CONNECT)!=PackageManager.PERMISSION_GRANTED) requestPermissions(new String[]{Manifest.permission.BLUETOOTH_CONNECT},44); }
    void startBridge(){ if(server==null){server=new BridgeServer(this); try{server.start(); status.setText("✓ ISSHO Printer Bridge aktif di http://127.0.0.1:9100\nPair WP58D di Bluetooth Android, lalu buka Kasir.");}catch(Exception e){status.setText("Bridge gagal: "+e.getMessage());}} }
}

class Printer {
    static BluetoothSocket socket; static OutputStream out; static final UUID SPP=MainActivity.SPP;
    static void connect(Activity a,String wanted) throws Exception { if(android.os.Build.VERSION.SDK_INT>=31 && a.checkSelfPermission(Manifest.permission.BLUETOOTH_CONNECT)!=PackageManager.PERMISSION_GRANTED) throw new Exception("Izin Bluetooth belum diberikan."); BluetoothAdapter ad=BluetoothAdapter.getDefaultAdapter(); if(ad==null) throw new Exception("Bluetooth tidak tersedia."); BluetoothDevice hit=null; for(BluetoothDevice d:ad.getBondedDevices()){String n=d.getName(); if(n!=null && (n.equalsIgnoreCase(wanted)||n.toUpperCase().contains("WP58D")||n.toUpperCase().contains("RPP02N")||n.toUpperCase().contains("PRINTER"))){hit=d;break;}} if(hit==null) throw new Exception("WP58D belum di-pair di Bluetooth Android."); try{if(socket!=null)socket.close();}catch(Exception ignored){}; socket=hit.createRfcommSocketToServiceRecord(SPP); socket.connect(); out=socket.getOutputStream(); }
    static synchronized void write(byte[] data)throws Exception{if(out==null)throw new Exception("Printer belum terhubung.");out.write(data);out.flush();}
    static void test()throws Exception{byte[] x=new byte[]{27,64,27,97,1,27,69,1};write(x);write("ISSHO CAFE\n".getBytes("ISO-8859-1"));write(new byte[]{27,69,0});write("TEST PRINT WP58D\nBLUETOOTH CLASSIC / SPP\nESC/POS 58mm\n--------------------------------\nPRINTER SIAP\nKoneksi aplikasi BERHASIL\n\n\n".getBytes("ISO-8859-1"));write(new byte[]{29,86,0});}
}
