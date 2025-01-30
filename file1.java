import java.io.*;
public class file1
{
	public static void main(String args[])
	{
		String filePath = "example.txt";
		try( FileInputStream fileInputStream=new FileInputStream ( filePath))
		{
			int content;
			while((content=fileInputStream.read())!= -1)
			{
				System.out.print((char)content);
			}
		}
		catch(IOException e)
		{
			System.out.println("error");
		}
	}
}