import java.io.*;
public class Out
{
	public static void main(String args[])
	{
		String file="output.txt";
		String content="hii";
		try(FileOutputStream f =new FileOutputStream(file))
		{
			byte[]contentBytes= content.getBytes();
			f.write(contentBytes);
			System.out.print("file written");
		}
		catch(IOException e)
		{
			System.out.print("error");
		}
	}
}
			
		