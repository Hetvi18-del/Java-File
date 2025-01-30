import java.io.*;
public class InoutS
{
	public static void main(String args[])
	{
		String filepath="example.txt";
		try(FileInputStream fileInputStream = new FileInputStream (filepath))
		{
			int content;
			while((content=fileInputStream.read())!= -1)
			{
				System.out.print((char)content);
			}
		}
		catch(IOException e)
		{
			System.out.print("error");
		}
	}
}
