import java.io.*;
import java.net.*;
public class Def2_S
{
	public static void main(String args[])
	{
		try{
			//create a server socket
			ServerSocket s=new ServerSocket(12345);
			System.out.println("Server listening on port 12345....");
			while(true){
				//Wait for a client to connect
				Socket clientSocket=s.accept();
				System.out.println("Client connected from:" +clientSocket.getInetAddress().getHostAddress());
				// Create input and output streams for communication with the client
				BufferedReader inputFromClient=new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
				PrintWriter outputToClient=new PrintWriter(clientSocket.getOutputStream(),true);
				// Read two numbers from the client
				int num1=Integer.parseInt(inputFromClient.readLine());
				int num2=Integer.parseInt(inputFromClient.readLine());
				//Calculate the squares
				int square1=num1*num1;
				int square2=num2*num2;
				//send the squares back to the client
				outputToClient.println("Square of" +num1+":"+square1);
				outputToClient.println("Square of" +num2+":"+square2);
				//close the connection with the current client
				clientSocket.close();
				System.out.println("Connection with client closed.");
			}
		}
		catch(IOException e)
		{
			e.printStackTrace();
		}
	}
}
	
				
				
				
				