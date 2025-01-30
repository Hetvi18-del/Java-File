import java.util.Scanner;
class Mat
{
	public static void main(String args[])
	{
		Scanner sc =new Scanner(System.in);
		int arr [] [] = new int [3] [3];
		int ar [] [] = new int [3] [3];
		int a []  []=new int [3] [3];
		System.out.print("enter array value:");
		for(int i=0;i<3;i++)
		{
			for(int j=0;j<3;j++)
			{
				arr[i][j] =sc.nextInt();
			}
		}
		for(int i=0;i<3;i++)
		{
			for(int j=0;j<3;j++)
			{
				System.out.print(arr[i][j]);
			}
			System.out.print("\n");
		}
		for(int i=0;i<3;i++)
		{
			for(int j=0;j<3;j++)
			{
				ar[i][j] =sc.nextInt();
			}
		}
		for(int i=0;i<3;i++)
		{
			for(int j=0;j<3;j++)
			{
				System.out.print(ar[i][j]);
			}
			System.out.print("\n");
		}
		for(int i=0;i<3;i++)
		{
			for(int j=0;j<3;j++)
			{
				a[i][j]=sc.nextInt();
			}
		}
		for(int i=0;i<3;i++)
		{
			for(int j=0;j<3;j++)
			{
				System.out.print(a[i][j]);
			}
			System.out.print("\n");
		}
		for(int i=0;i<3;i++)
		{
			for(int j=0;j<3;j++)
			{
				System.out.print(arr[i][j]+ar[i][j]+a[i][j]);
			}
			System.out.print("\n");
		}
	}
}
		
		
		