import java.util.Scanner;
class Odd
{
	public static void main(String ar[])
	{
		Scanner sc=new Scanner(System.in);
		int start,end1;
		start=sc.nextInt();
		System.out.print("enter the number of start:" +start);
		end1=sc.nextInt();
		System.out.print("enter the number of end:" +end1);
		int temp=0,temp2=0;
		int even[]=new int[100];
		int odd[]=new int[100];
		for (int i=start;i<=end1;i++)
		{
			if(i%2==0)
			{
				even[temp]=i;
				temp++;
			}
			else
			{
				odd[temp2]=i;
				temp2++;
			}
		}
		for (int i=0;i<temp;i++)
		{
				System.out.println(even[i]);
		}
		for(int i=0;i<temp2;i++)
		{
				System.out.println(odd[i]);
		}
	}
}
				
		
		