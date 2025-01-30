import java.net.URL;
import java.net.URLConnection;
import java.io.InputStreamReader;
import java.io.BufferedReader;
public class urlc
{
	public static void main(String args[])
	{
		try{
			URL url=new URL("https://www.w3Schools.com/Html");
			URL Connection c=url.openc();
			BufferedReader r=new BufferedReader (new InputStreamReader(c.getInputStream()));
			String line;
			
			