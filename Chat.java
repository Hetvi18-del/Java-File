import java.io.*;
import java.net.*;
public class Chat
{
	private static final int PORT=12345;
	public static void main(String args[])throws IOException
	{
		ServerSocket serverSocket=new ServerSocket(PORT);
		System.out.println("Server started on port" +PORT);
		while(true)
		{
			Socket clientSocket=serverSocket.accept();
			System.out.println("Client connected from"+clientSocket.getInetAddress());
			try(BufferedReader reader=new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
			BufferedReader reader1=new BufferedReader(new InputStreamReader(System.in));
			PrintWriter writer=new PrintWriter(clientSocket.getOutputStream(),true);
			)
			{
				String Msg;
				while((Msg=reader1.readLine())!=null)
				{
					System.out.println("Client msg:"+Msg);
					writer.println("Server:" +reader1.readLine());
				}
			}
		}
	}
}