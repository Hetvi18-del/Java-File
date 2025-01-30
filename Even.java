import java .util.Scanner;
class Even
{
	public static void main(String args[])
	{
		Scanner sc=new Scanner(System.in);
		int n;
		System.out.print("enter a number:");
		n=sc.nextInt();
		if(n%2==0)
		{
			System.out.print("The given number is even");
		}
		else
		{
			System.out.print("The given number is odd");
		}
	}
}