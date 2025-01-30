class Animal
{
	void show()
	{
		System.out.print("4 legs");
	}
}
class Dog extends Animal
{
	void show()
	{
		System.out.print("Bark");
	}
}
class Ride
{
	public static void main(String args[])
	{
		Dog d=new Dog();
		d.show();
	}
}
		