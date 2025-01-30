import java.net.URL;
public class url
{
	public static void main(String args[])
	{
		try{
			URL url=new URL("https://www.example.com:8080/index.html?name=test#section");
			System.out.println("Protocol:" +url.getProtocol());
			System.out.println("Host:" +url.getHost());
			System.out.println("Port:" +url.getPort());
			System.out.println("Path:" +url.getPath());
			System.out.println("Query:" +url.getQuery());
			System.out.println("File:" +url.getFile());
			System.out.println("Ref(Anchor):" +url.getRef());
		}
			catch(Exception e)
			{
				System.out.println("Malformed URL:" +e.getMessage());
			}
	}
}