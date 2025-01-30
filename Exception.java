class Exception 
{
	public static void main(String args[])
	{
		int i=10,j=0;
		try
		{
			int a=i/j;
		}
		catch(ArithmeticException e)
		{
			System.out.println("can't divide by 0");
		}
		int b=j/i;
		System.out.println(b);
	}
}
		
	
