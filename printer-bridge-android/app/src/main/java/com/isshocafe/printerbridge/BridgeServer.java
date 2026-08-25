package com.isshocafe.printerbridge;

import android.app.Activity;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;

public class BridgeServer {
  final Activity a; volatile boolean running; ServerSocket server;
  BridgeServer(Activity a){this.a=a;}
  void start() throws IOException { if(running)return; server=new ServerSocket(9100,20,InetAddress.getByName("127.0.0.1")); running=true; new Thread(()->{while(running){try{Socket s=server.accept(); new Thread(()->handle(s)).start();}catch(Exception e){if(running)e.printStackTrace();}}}).start(); }
  void handle(Socket s){try{InputStream in=s.getInputStream(); ByteArrayOutputStream h=new ByteArrayOutputStream(); int prev=-1,b; while((b=in.read())!=-1){h.write(b); if(prev=='\r'&&b=='\n'){byte[] x=h.toByteArray(); String hs=new String(x,StandardCharsets.ISO_8859_1); if(hs.endsWith("\r\n\r\n"))break;} prev=b;} String headers=new String(h.toByteArray(),StandardCharsets.ISO_8859_1); String first=headers.split("\r\n")[0]; int len=0; for(String line:headers.split("\r\n")){if(line.toLowerCase().startsWith("content-length:"))len=Integer.parseInt(line.substring(line.indexOf(':')+1).trim());} byte[] body=new byte[len]; int off=0; while(off<len){int n=in.read(body,off,len-off);if(n<0)break;off+=n;} String path=first.split(" ")[1]; String response;
      if(path.startsWith("/status")){response="{\"ok\":true,\"printer\":\"WP58D\",\"bridge\":\"ISSHO Printer Bridge\"}"; send(s,200,response);}
      else if(path.startsWith("/connect")){try{Printer.connect(a,"WP58D");response="{\"ok\":true,\"connected\":true,\"printer\":\"WP58D\"}";send(s,200,response);}catch(Exception e){send(s,500,"{\"ok\":false,\"error\":"+json(e.getMessage())+"}");}}
      else if(first.startsWith("POST ")&&path.startsWith("/print")){try{Printer.write(body);send(s,200,"{\"ok\":true,\"printed\":true}");}catch(Exception e){send(s,500,"{\"ok\":false,\"error\":"+json(e.getMessage())+"}");}}
      else if(path.startsWith("/test")){try{Printer.connect(a,"WP58D");Printer.test();send(s,200,"{\"ok\":true,\"printed\":true}");}catch(Exception e){send(s,500,"{\"ok\":false,\"error\":"+json(e.getMessage())+"}");}}
      else send(s,404,"{\"ok\":false,\"error\":\"not found\"}");
    }catch(Exception ignored){}finally{try{s.close();}catch(Exception ignored){}} }
  String json(String x){return "\""+String.valueOf(x).replace("\\","\\\\").replace("\"","\\\"").replace("\n"," ")+"\"";}
  void send(Socket s,int code,String body)throws IOException{byte[] b=body.getBytes(StandardCharsets.UTF_8);String h="HTTP/1.1 "+code+(code==200?" OK":" ERROR")+"\r\nContent-Type: application/json; charset=utf-8\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: GET,POST,OPTIONS\r\nAccess-Control-Allow-Headers: Content-Type\r\nAccess-Control-Allow-Private-Network: true\r\nContent-Length: "+b.length+"\r\nConnection: close\r\n\r\n";s.getOutputStream().write(h.getBytes(StandardCharsets.ISO_8859_1));s.getOutputStream().write(b);s.getOutputStream().flush();}
}
