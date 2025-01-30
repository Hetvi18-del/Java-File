import java.net.URL;
import java.net.URLConnection;
import java.io.InputStreamReader;
import java.io.BufferedReader;
public class url_Connection
{
	public static void main(String args[])
	{
		try{
			URL url= new URL("https://www.gmiu.edu.com/Html/");
			URLConnection connection=url.openConnection();
			BufferedReader r=new BufferedReader(new InputStreamReader(connection.getInputStream()));
			String line;
			while((line=r.readLine())!=null)
			{
				System.out.println(line);
			}
			r.close();
		}
		catch(Exception e)
		{
			e.printStackTrace();
		}
	}
}