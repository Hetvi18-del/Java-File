import java.io.*;
public class buf
{
	public  static void main(String args[])
	{
		String file="example.txt";
		try(BufferedReader r= new BufferedReader(new FileReader  (file)))
		{
			String line;
			while((line=r.readLine())!=null)
			{
				System.out.print(line);
			}
		}
		catch(IOException e)
		{
			System.out.print("error");
		}
	}
}
	