class swapping
{
	public static void main(String args[])
	{
		int a=45,b=90;
		System.out.println("the number of a is :" +a);
		System.out.println("the number of b is :" +b);
		a=a+b;
		b=a-b;
		a=a-b;
		System.out.println("after swapping");
		System.out.println("the number of a is :" +a);
		System.out.println("the number of b is :" +b);
	}
}