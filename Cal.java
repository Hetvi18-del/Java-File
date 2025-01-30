class Cal
{
	void add (int a,int b)
	{
		System.out.println("Addition is: " +(a+b) );
	}
	void sub (int a,int b)
	{
		System.out.println("Subtraction is: " +(a-b) );
	}
	void mul (int a,int b)
	{
		System.out.println("Multiplication is: " +(a*b) );
	}
	void div (int a,int b)
	{
		System.out.println("Division is: " +(a/b) );
	}
		public static void main(String args[])
		{
			int x=20,y=4;
			Cal c=new Cal();
			c.add(x,y);
			c.sub(x,y);
			c.mul(x,y);
			c.div(x,y);
		}
}
			
			