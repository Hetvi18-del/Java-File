import java.io.*;
public class op
{
	public static void main(String args[])
	{
		String file="output.txt";
		String content="Hello How are you?";
		try(FileOutputStream fileOutputStream=new FileOutputStream(file))
		{
			byte[]contentBytes=content.getBytes();
			fileOutputStream.write(contentBytes);
			System.out.println("file wriiten successfully!");
		}
		catch (IOException e)
		{
			System.out.print("error");
		}
	}
}
		