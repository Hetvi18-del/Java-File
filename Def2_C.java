import java.io.*;
import java.net.*;
import java.util.Scanner;
public class Def2_C
{
	public static void main(String args[])
	{
		try{
			Scanner sc=new Scanner(System.in);
			//create a socket to connect to the sever
			Socket s=new Socket("localhost",12345);
			//create input and output streams for communication with the server
			BufferedReader inputFromServer=new BufferedReader(new InputStreamReader(s.getInputStream()));
			PrintWriter outputToServer=new PrintWriter(s.getOutputStream(),true);
			//send two numbers to the sever
			String i;
			System.out.println("Enter your Massage:");
			i=sc.nextLine();
			outputToServer.println(i);
			int num1=sc.nextInt();
			int num2=sc.nextInt();
			outputToServer.println(num1);
			outputToServer.println(num2);
			//Recive and print the square from the sever 
			System.out.println(inputFromServer.readLine());
			System.out.println(inputFromServer.readLine());
			//close the connection with the sever 
			s.close();
		}
		catch(IOException e)
		{
			e.printStackTrace();
		}
	}
}
			