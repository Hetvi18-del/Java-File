class Max
{
	public static void main(String args[])
	{
		int a=20,b=34,c=56;
		if(a>b && a>c)
		{
			System.out.println("a is maximum");
		    if(b<c)
			{
				System.out.println("b is minimum");
			}
			else
			{
				System.out.println("c is minimum");
			}
		}
		else if(b>c && b>a)  
			{
				System.out.println("b is maximum");
			if(a<c)
			{
				System.out.println("a is minimum");
			else
			{
				System.out.println("c is minimum");
			}
		else 
			{
			if(a<b)
			{
				System.out.println("a is minimum");
			}
			else 
			{
				System.out.println("b is minimum");
			}
			}
	}
}