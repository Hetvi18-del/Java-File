import java.util.Scanner;
class sum
{
	public static void main(String args[])
	{
		Scanner sc=new Scanner(System.in);
		int n;
		System.out.print("enter size of array" );
		n=sc.nextInt();
		int arr[]=new int[n];
		for(int i=0;i<=n-1;i++)
		{
			arr[i]=sc.nextInt();
		}
		for(int i=0;i<=n-1;i++)
		{
			System.out.println(arr[i]);
		}
		int sum=0;
		for(int i=0;i<=n-1;i++)
		{
			sum=sum+arr[i];
		}
		System.out.print(+sum);
	}
}
		
