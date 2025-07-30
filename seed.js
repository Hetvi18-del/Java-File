const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const MenuItem = require('./models/MenuItem');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected for seeding'))
.catch(err => console.log(err));

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@canteen.com',
    password: 'admin123',
    phone: '+91-9876543210',
    role: 'admin'
  },
  {
    name: 'John Doe',
    email: 'john@student.edu',
    password: 'student123',
    phone: '+91-9876543211',
    studentId: 'CS2021001',
    department: 'Computer Science',
    year: 3,
    role: 'student',
    walletBalance: 500
  },
  {
    name: 'Jane Smith',
    email: 'jane@student.edu',
    password: 'student123',
    phone: '+91-9876543212',
    studentId: 'EC2021002',
    department: 'Electronics',
    year: 2,
    role: 'student',
    walletBalance: 300
  },
  {
    name: 'Mike Johnson',
    email: 'mike@student.edu',
    password: 'student123',
    phone: '+91-9876543213',
    studentId: 'ME2021003',
    department: 'Mechanical',
    year: 4,
    role: 'student',
    walletBalance: 750
  }
];

const sampleMenuItems = [
  // Breakfast
  {
    name: 'Idli Sambar',
    description: 'Soft steamed rice cakes served with lentil curry and coconut chutney',
    category: 'breakfast',
    price: 40,
    ingredients: ['Rice', 'Urad Dal', 'Toor Dal', 'Vegetables'],
    nutritionalInfo: {
      calories: 250,
      protein: 8,
      carbs: 45,
      fat: 3
    },
    isVegetarian: true,
    isVegan: false,
    spiceLevel: 'mild',
    preparationTime: 15,
    isAvailable: true,
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    availableTime: { start: '08:00', end: '11:00' },
    quantity: 50,
    ratings: { average: 4.5, count: 23 }
  },
  {
    name: 'Masala Dosa',
    description: 'Crispy crepe filled with spiced potato filling, served with sambar and chutney',
    category: 'breakfast',
    price: 60,
    ingredients: ['Rice', 'Urad Dal', 'Potatoes', 'Onions', 'Spices'],
    nutritionalInfo: {
      calories: 350,
      protein: 10,
      carbs: 55,
      fat: 12
    },
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'medium',
    preparationTime: 20,
    isAvailable: true,
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    availableTime: { start: '08:00', end: '11:00' },
    quantity: 30,
    ratings: { average: 4.7, count: 45 }
  },
  {
    name: 'Poha',
    description: 'Flattened rice cooked with onions, mustard seeds, and curry leaves',
    category: 'breakfast',
    price: 35,
    ingredients: ['Flattened Rice', 'Onions', 'Peanuts', 'Curry Leaves'],
    nutritionalInfo: {
      calories: 200,
      protein: 6,
      carbs: 35,
      fat: 5
    },
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'mild',
    preparationTime: 10,
    isAvailable: true,
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    availableTime: { start: '08:00', end: '11:00' },
    quantity: 40,
    ratings: { average: 4.2, count: 18 }
  },

  // Lunch
  {
    name: 'Chicken Biryani',
    description: 'Fragrant basmati rice cooked with tender chicken pieces and aromatic spices',
    category: 'lunch',
    price: 120,
    ingredients: ['Basmati Rice', 'Chicken', 'Onions', 'Yogurt', 'Spices'],
    nutritionalInfo: {
      calories: 450,
      protein: 25,
      carbs: 55,
      fat: 15
    },
    isVegetarian: false,
    spiceLevel: 'medium',
    preparationTime: 30,
    isAvailable: true,
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    availableTime: { start: '12:00', end: '15:00' },
    quantity: 25,
    ratings: { average: 4.8, count: 67 }
  },
  {
    name: 'Paneer Butter Masala',
    description: 'Cottage cheese cubes in rich tomato-based creamy gravy',
    category: 'lunch',
    price: 100,
    ingredients: ['Paneer', 'Tomatoes', 'Cream', 'Onions', 'Spices'],
    nutritionalInfo: {
      calories: 380,
      protein: 18,
      carbs: 15,
      fat: 28
    },
    isVegetarian: true,
    spiceLevel: 'medium',
    preparationTime: 25,
    isAvailable: true,
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    availableTime: { start: '12:00', end: '15:00' },
    quantity: 30,
    ratings: { average: 4.6, count: 52 }
  },
  {
    name: 'Dal Tadka',
    description: 'Yellow lentils tempered with cumin, garlic, and aromatic spices',
    category: 'lunch',
    price: 70,
    ingredients: ['Toor Dal', 'Cumin', 'Garlic', 'Onions', 'Tomatoes'],
    nutritionalInfo: {
      calories: 220,
      protein: 12,
      carbs: 35,
      fat: 6
    },
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'mild',
    preparationTime: 20,
    isAvailable: true,
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    availableTime: { start: '12:00', end: '15:00' },
    quantity: 50,
    ratings: { average: 4.3, count: 34 }
  },
  {
    name: 'Jeera Rice',
    description: 'Basmati rice cooked with cumin seeds and aromatic spices',
    category: 'lunch',
    price: 50,
    ingredients: ['Basmati Rice', 'Cumin Seeds', 'Bay Leaves', 'Ghee'],
    nutritionalInfo: {
      calories: 280,
      protein: 6,
      carbs: 58,
      fat: 4
    },
    isVegetarian: true,
    spiceLevel: 'none',
    preparationTime: 15,
    isAvailable: true,
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    availableTime: { start: '12:00', end: '15:00' },
    quantity: 60,
    ratings: { average: 4.1, count: 28 }
  },

  // Dinner
  {
    name: 'Mutton Curry',
    description: 'Tender mutton pieces cooked in rich and spicy gravy',
    category: 'dinner',
    price: 150,
    ingredients: ['Mutton', 'Onions', 'Tomatoes', 'Yogurt', 'Spices'],
    nutritionalInfo: {
      calories: 420,
      protein: 35,
      carbs: 8,
      fat: 28
    },
    isVegetarian: false,
    spiceLevel: 'hot',
    preparationTime: 45,
    isAvailable: true,
    availableDays: ['friday', 'saturday', 'sunday'],
    availableTime: { start: '19:00', end: '22:00' },
    quantity: 20,
    ratings: { average: 4.9, count: 31 }
  },
  {
    name: 'Palak Paneer',
    description: 'Cottage cheese cubes in creamy spinach gravy',
    category: 'dinner',
    price: 90,
    ingredients: ['Paneer', 'Spinach', 'Cream', 'Onions', 'Garlic'],
    nutritionalInfo: {
      calories: 320,
      protein: 16,
      carbs: 12,
      fat: 24
    },
    isVegetarian: true,
    spiceLevel: 'mild',
    preparationTime: 25,
    isAvailable: true,
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    availableTime: { start: '19:00', end: '22:00' },
    quantity: 35,
    ratings: { average: 4.4, count: 42 }
  },

  // Snacks
  {
    name: 'Samosa',
    description: 'Crispy fried pastry filled with spiced potatoes and peas',
    category: 'snacks',
    price: 25,
    ingredients: ['Flour', 'Potatoes', 'Peas', 'Spices', 'Oil'],
    nutritionalInfo: {
      calories: 180,
      protein: 4,
      carbs: 22,
      fat: 8
    },
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'medium',
    preparationTime: 20,
    isAvailable: true,
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    availableTime: { start: '16:00', end: '19:00' },
    quantity: 80,
    ratings: { average: 4.5, count: 89 }
  },
  {
    name: 'Pani Puri',
    description: 'Crispy hollow puris filled with spicy tangy water and chutneys',
    category: 'snacks',
    price: 30,
    ingredients: ['Semolina', 'Chickpeas', 'Potatoes', 'Tamarind', 'Mint'],
    nutritionalInfo: {
      calories: 150,
      protein: 5,
      carbs: 28,
      fat: 3
    },
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'hot',
    preparationTime: 10,
    isAvailable: true,
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    availableTime: { start: '16:00', end: '19:00' },
    quantity: 60,
    ratings: { average: 4.7, count: 76 }
  },
  {
    name: 'Vada Pav',
    description: 'Spiced potato fritter served in a bun with chutneys',
    category: 'snacks',
    price: 20,
    ingredients: ['Potatoes', 'Bread', 'Chickpea Flour', 'Green Chutney'],
    nutritionalInfo: {
      calories: 200,
      protein: 6,
      carbs: 32,
      fat: 6
    },
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'medium',
    preparationTime: 15,
    isAvailable: true,
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    availableTime: { start: '16:00', end: '19:00' },
    quantity: 70,
    ratings: { average: 4.3, count: 55 }
  },

  // Beverages
  {
    name: 'Masala Chai',
    description: 'Traditional Indian spiced tea with milk and aromatic spices',
    category: 'beverages',
    price: 15,
    ingredients: ['Tea Leaves', 'Milk', 'Sugar', 'Cardamom', 'Ginger'],
    nutritionalInfo: {
      calories: 80,
      protein: 3,
      carbs: 12,
      fat: 3
    },
    isVegetarian: true,
    spiceLevel: 'mild',
    preparationTime: 5,
    isAvailable: true,
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    availableTime: { start: '08:00', end: '22:00' },
    quantity: 100,
    ratings: { average: 4.6, count: 124 }
  },
  {
    name: 'Fresh Lime Water',
    description: 'Refreshing lime juice with mint and a hint of salt',
    category: 'beverages',
    price: 20,
    ingredients: ['Lime', 'Water', 'Mint', 'Salt', 'Sugar'],
    nutritionalInfo: {
      calories: 40,
      protein: 0,
      carbs: 10,
      fat: 0
    },
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'none',
    preparationTime: 3,
    isAvailable: true,
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    availableTime: { start: '10:00', end: '20:00' },
    quantity: 80,
    ratings: { average: 4.2, count: 67 }
  },
  {
    name: 'Lassi',
    description: 'Creamy yogurt-based drink available in sweet and salty variants',
    category: 'beverages',
    price: 35,
    ingredients: ['Yogurt', 'Water', 'Sugar', 'Salt', 'Mint'],
    nutritionalInfo: {
      calories: 120,
      protein: 6,
      carbs: 18,
      fat: 3
    },
    isVegetarian: true,
    spiceLevel: 'none',
    preparationTime: 5,
    isAvailable: true,
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    availableTime: { start: '11:00', end: '19:00' },
    quantity: 40,
    ratings: { average: 4.4, count: 38 }
  },

  // Desserts
  {
    name: 'Gulab Jamun',
    description: 'Soft milk dumplings soaked in rose-flavored sugar syrup',
    category: 'desserts',
    price: 40,
    ingredients: ['Milk Powder', 'Flour', 'Sugar', 'Rose Water', 'Cardamom'],
    nutritionalInfo: {
      calories: 220,
      protein: 4,
      carbs: 40,
      fat: 6
    },
    isVegetarian: true,
    spiceLevel: 'none',
    preparationTime: 30,
    isAvailable: true,
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    availableTime: { start: '12:00', end: '22:00' },
    quantity: 30,
    ratings: { average: 4.8, count: 45 }
  },
  {
    name: 'Ice Cream',
    description: 'Creamy ice cream available in vanilla, chocolate, and strawberry flavors',
    category: 'desserts',
    price: 50,
    ingredients: ['Milk', 'Cream', 'Sugar', 'Flavoring'],
    nutritionalInfo: {
      calories: 180,
      protein: 3,
      carbs: 22,
      fat: 9
    },
    isVegetarian: true,
    spiceLevel: 'none',
    preparationTime: 2,
    isAvailable: true,
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    availableTime: { start: '12:00', end: '22:00' },
    quantity: 50,
    ratings: { average: 4.5, count: 62 }
  }
];

async function seedDatabase() {
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await MenuItem.deleteMany({});
    
    // Seed Users
    console.log('Seeding users...');
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${user.name} (${user.email})`);
    }
    
    // Seed Menu Items
    console.log('Seeding menu items...');
    for (const itemData of sampleMenuItems) {
      const menuItem = new MenuItem(itemData);
      await menuItem.save();
      console.log(`Created menu item: ${menuItem.name} - ₹${menuItem.price}`);
    }
    
    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('Admin: admin@canteen.com / admin123');
    console.log('Student 1: john@student.edu / student123');
    console.log('Student 2: jane@student.edu / student123');
    console.log('Student 3: mike@student.edu / student123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedDatabase();