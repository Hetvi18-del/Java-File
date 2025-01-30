class multiple
{
	public  static void main(String args[])
	{
		int a=5,b=0;
		int[] arr=new int[3];
		arr[1]=10;
		arr[2]=20;
		arr[3]=30;
		try
		{
			int c=a/b;
			System.out.println(c);
			System.out.println("Arr:" +arr[5]);
		}
		catch(ArithmeticException e)
		{
			System.out.println("can't divide by 0");
		}
		catch(ArrayIndexOutOfBoundsException e)
		{
			System.out.println("Array Exception");
		}
		System.out.println("Completed");
	}
}