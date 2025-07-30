# 🍽️ Campus Canteen - Digital Food Service

A comprehensive web application for campus food services that allows students to view daily menus, place orders, manage their digital wallet, and provide feedback. Includes a powerful admin panel for managing the entire canteen operation.

## ✨ Features

### 🎓 Student Features
- **User Authentication**: Secure registration and login system
- **Daily Menu**: Browse categorized menu items with detailed information
- **Smart Ordering**: Add items to cart and place orders with quantity control
- **Digital Wallet**: Cashless transactions with wallet recharge functionality
- **Order Tracking**: Real-time order status updates
- **Feedback System**: Rate and review meals with detailed feedback
- **Order History**: View past orders and transaction history
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 👨‍💼 Admin Features
- **Dashboard Analytics**: Comprehensive overview of daily operations
- **Menu Management**: Add, edit, and manage menu items with availability controls
- **Order Management**: Track and update order statuses in real-time
- **User Management**: View and manage student accounts
- **Transaction Monitoring**: Track all wallet transactions and payments
- **Feedback Management**: View and respond to customer feedback
- **Analytics & Reports**: Detailed insights into sales and popular items

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients and animations
- **JavaScript (ES6+)** - Interactive functionality
- **Font Awesome** - Icons
- **Google Fonts** - Typography

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd canteen-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/canteen_db
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Seed the database** (Optional - for demo data)
   ```bash
   node seed.js
   ```

6. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

7. **Access the application**
   Open your browser and navigate to `http://localhost:5000`

## 👥 Demo Accounts

After running the seed script, you can use these demo accounts:

### Admin Account
- **Email**: admin@canteen.com
- **Password**: admin123

### Student Accounts
- **Email**: john@student.edu | **Password**: student123
- **Email**: jane@student.edu | **Password**: student123
- **Email**: mike@student.edu | **Password**: student123

## 📱 Usage Guide

### For Students

1. **Registration**: Create an account with your student details
2. **Browse Menu**: Explore daily menu items by category
3. **Place Orders**: Add items to cart and checkout using wallet balance
4. **Recharge Wallet**: Add money to your digital wallet for cashless transactions
5. **Track Orders**: Monitor your order status in real-time
6. **Provide Feedback**: Rate and review your meals

### For Admins

1. **Dashboard**: Monitor daily operations and key metrics
2. **Menu Management**: Add new items, update prices, and manage availability
3. **Order Processing**: Update order statuses and manage the kitchen workflow
4. **User Management**: View student accounts and manage user access
5. **Analytics**: Access detailed reports and insights

## 🗂️ Project Structure

```
canteen-app/
├── models/                 # Database models
│   ├── User.js            # User model (students & admins)
│   ├── MenuItem.js        # Menu item model
│   ├── Order.js           # Order model
│   ├── Transaction.js     # Wallet transaction model
│   └── Feedback.js        # Feedback model
├── routes/                # API routes
│   ├── auth.js           # Authentication routes
│   ├── menu.js           # Menu management routes
│   ├── orders.js         # Order management routes
│   ├── wallet.js         # Wallet & transaction routes
│   ├── feedback.js       # Feedback routes
│   └── admin.js          # Admin panel routes
├── middleware/           # Custom middleware
│   └── auth.js          # Authentication middleware
├── public/              # Frontend files
│   ├── index.html      # Main HTML file
│   └── app.js          # Frontend JavaScript
├── uploads/            # File uploads directory
├── .env               # Environment variables
├── server.js          # Main server file
├── seed.js           # Database seeding script
└── package.json      # Project dependencies
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get single menu item
- `POST /api/menu` - Create menu item (Admin)
- `PUT /api/menu/:id` - Update menu item (Admin)
- `DELETE /api/menu/:id` - Delete menu item (Admin)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PATCH /api/orders/:id/cancel` - Cancel order
- `GET /api/orders/admin/all` - Get all orders (Admin)
- `PATCH /api/orders/:id/status` - Update order status (Admin)

### Wallet
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/recharge` - Recharge wallet
- `GET /api/wallet/transactions` - Get transaction history
- `GET /api/wallet/stats` - Get wallet statistics

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/menu-item/:id` - Get item feedback
- `GET /api/feedback/my-feedback` - Get user feedback
- `POST /api/feedback/:id/helpful` - Mark feedback as helpful

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Express-validator for request validation
- **Role-based Access**: Different permissions for students and admins
- **CORS Protection**: Cross-origin request security

## 🎨 UI/UX Features

- **Modern Design**: Clean and intuitive interface
- **Responsive Layout**: Works on all device sizes
- **Interactive Elements**: Smooth animations and hover effects
- **Real-time Updates**: Dynamic content updates without page refresh
- **Loading States**: Visual feedback during data loading
- **Error Handling**: User-friendly error messages

## 📊 Database Schema

### Users Collection
- Personal information (name, email, phone)
- Student details (ID, department, year)
- Wallet balance and transaction history
- Authentication credentials

### Menu Items Collection
- Item details (name, description, price)
- Nutritional information and dietary preferences
- Availability schedules and quantity tracking
- Ratings and reviews

### Orders Collection
- Order items and quantities
- Payment information and status
- Timestamps and delivery tracking
- Customer notes and special instructions

### Transactions Collection
- Wallet operations (credit/debit)
- Payment gateway integration
- Balance tracking and audit trail

### Feedback Collection
- Ratings and reviews for menu items
- Admin responses and moderation
- Helpful votes and user engagement

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production` in your environment variables
2. Configure production MongoDB URI
3. Set secure JWT secret
4. Configure email and payment gateway credentials

### Deployment Options
- **Heroku**: Easy deployment with MongoDB Atlas
- **DigitalOcean**: VPS deployment with PM2
- **AWS**: EC2 with RDS or DocumentDB
- **Vercel**: Serverless deployment option

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) section
2. Create a new issue with detailed information
3. Contact the development team

## 🔮 Future Enhancements

- **Mobile App**: React Native mobile application
- **Payment Gateway**: Integration with Stripe/Razorpay
- **Push Notifications**: Real-time order updates
- **Inventory Management**: Stock tracking and alerts
- **Loyalty Program**: Points and rewards system
- **Multi-language Support**: Internationalization
- **Advanced Analytics**: Machine learning insights
- **QR Code Ordering**: Contactless ordering system

---

Made with ❤️ for campus food services