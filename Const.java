class Const
{
	String name;
	int age;
	void show(String n, int a)
	{
		name=n;
		age=a;
	}
	void Student ()
	{
		System.out.println("Name:" +name);
		System.out.println("Age:" +age);
	}
	public static void main(String args[])
	{
		Const c=new Const("Hetvi",18);
		c.Student();
		c.show();
	}	
}
		