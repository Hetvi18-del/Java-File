import java.io.*;
import java.net.URL;
public class urlh
{
	public static void main(String args[])
	{
		try{
			URL url=new URL("https://www.example.com:8076/index.html?name=te#section");
			System.out.print("protocol:" +url.getProtocol());
			System.out.print("host:" +url.getHost());
			System.out.print("port:" +url.getPort());
			System.out.print("path:" +url.getPath());
			System.out.print("Querry:" +url.getQuery());
			System.out.print("Ref(Anchor):" +url.getRef());
		}
		catch(IOException e)
		{
			System.out.print("error");
		}
	}
}