import java.io.*;
public class file
{
	public static void main(String args[])
	{
		String filepath = "example.txt";
		try (BufferedReader reader= new BufferedReader(new FileReader (filepath)))
		{
			String line;
			while((line= reader.readLine())!=null)
			{
				System.out.println(line);
			}
		}
		catch(IOException e)
		{
			System.out.println("error");
		}
	}
}
			