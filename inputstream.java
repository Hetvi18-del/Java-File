import java.io.*;
public class Inputstream
{
	public static void main(String args[])
	{
		String file="example.txt";
		try(FileInputStream f=new FileInputStream(file))
		{
			int c;
			while((c=f.read())!= -1)
			{
				System.out.print((char)c);
			}
		}
		catch(IOException e)
		{
			System.out.print("error");
		}
	}
}	