import java.util.Scanner;
class Odde
{
	public static void main(String ar[])
	{
		Scanner sc=new Scanner(System.in);
		int start,end1;
		start=sc.nextInt();
		System.out.print("enter the number of start:" +start);
		end1=sc.nextInt();
		System.out.print("enter the number of end:" +end1);
		int t=0,t2=0;
		int even[]=new int[100];
		int odd[]=new int[100];
		for (int i=start;i<=end1;i++)
		{
			if(i%2==0)
			{
				even[t]=i;
				t++;
			}
			else
			{
				odd[t2]=i;
				t2++;
			}
		}
		for (int i=0;i<t;i++)
		{
				System.out.println(even[i]);
		}
		for (int i=0;i<t2;i++)
		{
				System.out.println(odd[i]);
		}
	}
}