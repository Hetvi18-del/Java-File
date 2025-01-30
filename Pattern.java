class Pattern
{
	public static void main(String args[])
	{
		int a=4;
		for(int i=0;i<=a;i++)
		{
			for(int j=i;j<a;j++)
			{
				System.out.print(" ");
			}
				for(int k=1;k<=(2*i-1);k++)
				{
					System.out.print("*");
				}
					System.out.println();
		}
	}
}