import java.util.Scanner;
public class ipadd
{
	public static void main(String args[])
	{
		Scanner sc=new Scanner(System.in);
		System.out.println("enter an IP Address:");
		String ip=sc.nextLine();
		String[]parts = ip.split("\\.");
		if(parts.length!=4)
		{
			System.out.println("Invalid IP address format!");
			return;
		}
		try
		{
			int fp=Integer.parseInt(parts[0]);
			if(fp>=0 && fp<=127)
			{
				System.out.println("class A");
			}
			else if ( fp>=128 && fp<=191)
			{
				System.out.println("class B");
			}
			else if ( fp>=192 && fp<=223)
			{
				System.out.println("class c");
			}
			else if ( fp>=224 && fp<=239)
			{
				System.out.println("class D");
			}
			else if ( fp>=240 && fp<=255)
			{
				System.out.println("class E");
			}
			else
			{
				System.out.println("Invalid IP address range !");
			}
		}
		catch (NumberFormatException e)
		{
			System.out.println("Invalid IP address ! Make sure it only contains number");
		}
		sc.close();
	}
}