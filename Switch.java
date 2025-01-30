import java.util.Scanner;
class Switch
{
	public static void main(String args[])
	{
		int choice;
		Scanner sc=new Scanner(System.in);
		System.out.println(" 1 for English");
		System.out.println(" 2 for Gujarati");
		System.out.println(" 3 for Hindi");
		System.out.print("Enter the choice:" );
		choice=sc.nextInt();
		System.out.println("The choice is:" +choice);
		switch(choice)
		{
			case 1:
			System.out.println(" English");
			break;
				case 2:
				System.out.println(" Gujarati");
				break;
					case 3:
					System.out.println("Hindi");
					break;
						default:
						System.out.println("Invalid");
		}
	}
}
