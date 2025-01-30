import java.util.Scanner;
class Swapar
{
	public static void main(String args[])
	{
		int n;
		Scanner sc=new Scanner(System.in);
		System.out.print(" enter the size of array:");
		int arr[]=new int[n];
		for (int i=0;i<=n-1;i++)
		{
			arr[i]=sc.nextInt();
		}
		for (int i=0;i<=n-1;i++)
		{
			System.out.println(+arr[i]);
		}
		
		