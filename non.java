import java.io.*;
import java.util.*;
class non
{
	public static void main(String args[])
	{
		if(args.length==1)
		{
			String filename=args[0];
			TreeSet <String>set=new TreeSet<>();
			File file = new File(filename);
			try
			{
				Scanner sc=new Scanner(file);
				while(sc.hasNext())
				{
					set.add(sc.next());
				}
				TreeSet<String> st=(TreeSet<String>)set.descendingSet();
				for(String a:st)
				System.out.println(a);
			}
			catch(FileNotFoundException e)
			{
				e.printStackTrace();
			}
		}
		else
		{
			System.out.println("Please,Pass the file name as Command Line Argument");
		}
	}
}
				
