class Star
{
	public static void main(String args[])
	{
		int n=4,i=1;
		do{
			int j=1;
			do{	
				System.out.print("*");
				j++;
			}while(j<=i);
		System.out.println( );
		i++;
		}while(i<=n);
	}
}