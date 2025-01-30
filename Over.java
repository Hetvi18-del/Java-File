class Over
{
	void Name(int x)
	{
		System.out.print("the number is :" +x);
	}
	void Name(string n)
	{
		System.out.print("name is : " +n);
	}
	public static void main(String args[])
	{
		int a=45;
		string na=Hetvi;
		Over o=new Over(a,na);
		o.name();
		o.name();
	}
}