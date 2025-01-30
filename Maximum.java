class Maximum
{
	public static void main(String args[])
	{
		int a=10,b=20,c=30;
		if (a>b )
		{
			if(a>c)
			{
				System.out.print("a is maximum");
			}
			else
			{
				System.out.println("c is maximum");
			}
		}
		else
		{
			if(b>c)
			{
				System.out.println("b is maximum");
			else
			{
				System.out.println("c is maximum");
			}
		}
	}
}