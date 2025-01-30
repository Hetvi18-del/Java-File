import java.io.*;
public class Outputstream
{
	public static void main(String args[])
	{
		String file="example.txt";
		String c="hii";
		try(FileOutputStream f=new FileOutputStream(file))
		{
			byte[] cBytes=c.getBytes();
			f.write(cBytes);
		}
		catch(IOException e)
		{
			System.out.print("error");
		}
	}
}