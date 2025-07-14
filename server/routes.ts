import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { storage } from "./storage";
import { authenticate, authorize, AuthRequest } from "./middleware/auth";
import { sendOtp, verifyOtp } from "./services/otpService";
import { sendWelcomeEmail } from "./services/emailService";
import { chatbotService } from "./services/chatbotService";
import { searchService } from "./services/searchService";
import { validateInput, secureUserRegistrationSchema, secureLoginSchema, secureBookingSchema, secureAddressSchema } from "./validation/inputValidation";
import { insertUserSchema, insertServiceSchema, insertBookingSchema, insertCategorySchema, insertPromotionSchema, insertPaymentMethodSchema } from "@shared/schema";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(cookieParser());

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { 
        name, 
        email, 
        mobile, 
        password, 
        businessName,
        businessAddress,
        businessPhone,
        experienceYears,
        skills
      } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // All users start as active by default
      const userStatus = 'active';

      // Create user
      const user = await storage.createUser({
        name,
        email,
        mobile,
        password: hashedPassword,
        role: 'user',
        status: userStatus as any,
        isVerifiedSeller: false,
        isEmailVerified: false,
        isMobileVerified: false,
        businessName: null,
        businessAddress: null,
        businessPhone: null,
        experienceYears: null,
        skills: null,
      });

      // Send welcome email (disabled for testing)
      // await sendWelcomeEmail(email, name);

      const message = "User created successfully";

      res.status(201).json({ message, userId: user.id });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { identifier, password } = req.body; // identifier can be email or mobile

      // Find user by email or mobile
      let user = await storage.getUserByEmail(identifier);
      if (!user) {
        user = await storage.getUserByMobile(identifier);
      }

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

      // Set cookie
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('authToken');
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/auth/me", authenticate, (req: AuthRequest, res) => {
    res.json({ user: req.user });
  });

  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { identifier, type } = req.body; // type: 'email' or 'mobile'
      
      await sendOtp(identifier, type);
      res.json({ message: "OTP sent successfully" });
    } catch (error) {
      console.error("OTP send error:", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { identifier, type, code } = req.body;
      
      const isValid = await verifyOtp(identifier, type, code);
      if (!isValid) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      // Update user verification status
      let user = await storage.getUserByEmail(identifier);
      if (!user) {
        user = await storage.getUserByMobile(identifier);
      }

      if (user) {
        const updateData = type === 'email' ? { isEmailVerified: true } : { isMobileVerified: true };
        await storage.updateUser(user.id, updateData);
      }

      res.json({ message: "OTP verified successfully" });
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).json({ message: "OTP verification failed" });
    }
  });

  app.post("/api/auth/become-seller", authenticate, async (req: AuthRequest, res) => {
    try {
      const { businessName, businessAddress, businessPhone, experienceYears, skills } = req.body;
      
      // Check if user is already a seller
      if (req.user.role === 'seller') {
        return res.status(400).json({ message: "You are already a seller" });
      }

      // Update user to seller with pending status
      await storage.updateUser(req.user.id, {
        role: 'seller',
        status: 'pending',
        businessName,
        businessAddress,
        businessPhone,
        experienceYears,
        skills,
        isVerifiedSeller: false,
      });

      res.json({ message: "Seller application submitted successfully. You'll be notified once approved." });
    } catch (error) {
      console.error("Become seller error:", error);
      res.status(500).json({ message: "Failed to submit seller application" });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Cities routes
  app.get("/api/cities", async (req, res) => {
    try {
      const cities = [
        { id: 1, name: 'Doha' },
        { id: 2, name: 'Al Rayyan' },
        { id: 3, name: 'Al Wakrah' },
        { id: 4, name: 'Umm Salal' },
        { id: 5, name: 'Al Daayen' },
        { id: 6, name: 'Lusail' },
        { id: 7, name: 'West Bay' }
      ];
      res.json(cities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cities" });
    }
  });

  app.get("/api/categories/active", async (req, res) => {
    try {
      const categories = await storage.getActiveCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active categories" });
    }
  });

  app.post("/api/categories", authenticate, authorize(['admin', 'superadmin']), async (req: AuthRequest, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/categories/:id", authenticate, authorize(['admin', 'superadmin']), async (req: AuthRequest, res) => {
    try {
      const category = await storage.updateCategory(parseInt(req.params.id), req.body);
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", authenticate, authorize(['admin', 'superadmin']), async (req: AuthRequest, res) => {
    try {
      await storage.deleteCategory(parseInt(req.params.id));
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Services routes
  app.get("/api/services", async (req, res) => {
    try {
      const { category, categoryName, search, city, minPrice, maxPrice } = req.query;
      
      let services;
      if (search) {
        services = await searchService.searchServices(search as string, {
          category: category as string,
          city: city as string,
          minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        });
      } else if (category) {
        services = await storage.getServicesByCategory(parseInt(category as string));
      } else if (categoryName) {
        // Get all categories to find the one with matching name
        const categories = await storage.getAllCategories();
        const matchingCategory = categories.find(cat => 
          cat.name.toLowerCase() === categoryName.toString().toLowerCase()
        );
        if (matchingCategory) {
          services = await storage.getServicesByCategory(matchingCategory.id);
        } else {
          services = [];
        }
      } else if (city) {
        services = await searchService.getServicesByLocation(city as string);
      } else {
        services = await storage.getAllServices();
      }
      
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });
  
  app.get("/api/services/popular", async (req, res) => {
    try {
      const services = await searchService.getPopularServices();
      res.json(services);
    } catch (error) {
      console.error("Popular services error:", error);
      res.status(500).json({ message: "Failed to fetch popular services" });
    }
  });

  // Testimonials routes
  app.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials = [
        {
          id: 1,
          name: "Ahmed Al-Rashid",
          location: "Doha, Qatar",
          rating: 5,
          comment: "Excellent service! The team was professional, punctual, and did an amazing job cleaning our villa. Highly recommend!"
        },
        {
          id: 2,
          name: "Sarah Johnson",
          location: "Al Rayyan, Qatar",
          rating: 5,
          comment: "Perfect AC cleaning service! They were thorough and my AC is working better than ever. Great value for money."
        },
        {
          id: 3,
          name: "Mohammed Al-Thani",
          location: "West Bay, Qatar",
          rating: 5,
          comment: "Outstanding office cleaning service! Our workspace has never looked better. Professional and reliable team."
        }
      ];
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });

  // Stats routes
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = [
        { value: "5000+", label: "Happy Customers" },
        { value: "500+", label: "Services Completed" },
        { value: "50+", label: "Professional Cleaners" },
        { value: "4.9", label: "Average Rating" }
      ];
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/services/:id", async (req, res) => {
    try {
      const service = await storage.getService(parseInt(req.params.id));
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });

  app.post("/api/services", authenticate, authorize(['admin', 'superadmin']), async (req: AuthRequest, res) => {
    try {
      const service = await storage.createService(req.body);
      res.status(201).json(service);
    } catch (error) {
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.put("/api/services/:id", authenticate, authorize(['admin', 'superadmin']), async (req: AuthRequest, res) => {
    try {
      const service = await storage.updateService(parseInt(req.params.id), req.body);
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  app.delete("/api/services/:id", authenticate, authorize(['admin', 'superadmin']), async (req: AuthRequest, res) => {
    try {
      await storage.deleteService(parseInt(req.params.id));
      res.json({ message: "Service deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Bookings routes
  app.get("/api/bookings", authenticate, async (req: AuthRequest, res) => {
    try {
      let bookings;
      if (req.user.role === 'admin' || req.user.role === 'superadmin') {
        bookings = await storage.getAllBookings();
      } else if (req.user.role === 'employee') {
        bookings = await storage.getBookingsByEmployee(req.user.id);
      } else {
        bookings = await storage.getBookingsByUser(req.user.id);
      }
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post("/api/bookings", authenticate, async (req: AuthRequest, res) => {
    try {
      // Get service details to calculate total amount
      const service = await storage.getService(req.body.serviceId);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      const bookingData = {
        userId: req.user.id,
        serviceId: req.body.serviceId,
        address: req.body.address,
        city: req.body.city,
        scheduledDate: new Date(req.body.scheduledDate),
        totalAmount: service.price, // Use service price as total amount
        notes: req.body.notes || null,
      };

      console.log("Creating booking with data:", bookingData);

      const booking = await storage.createBooking(bookingData);

      // Trigger chatbot to assign employee
      try {
        await chatbotService.assignBookingToEmployee(booking.id);
      } catch (error) {
        console.error("Error assigning booking to employee:", error);
      }

      res.status(201).json(booking);
    } catch (error) {
      console.error("Booking creation error:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.put("/api/bookings/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const booking = await storage.updateBooking(parseInt(req.params.id), req.body);
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  // Favorites routes
  app.get("/api/favorites", authenticate, async (req: AuthRequest, res) => {
    try {
      const favorites = await storage.getFavoritesByUser(req.user.id);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", authenticate, async (req: AuthRequest, res) => {
    try {
      const favorite = await storage.createFavorite({
        userId: req.user.id,
        serviceId: req.body.serviceId,
      });
      res.status(201).json(favorite);
    } catch (error) {
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites/:serviceId", authenticate, async (req: AuthRequest, res) => {
    try {
      await storage.deleteFavorite(req.user.id, parseInt(req.params.serviceId));
      res.json({ message: "Favorite removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // Cart routes
  app.get("/api/cart", authenticate, async (req: AuthRequest, res) => {
    try {
      const cartItems = await storage.getCartByUser(req.user.id);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", authenticate, async (req: AuthRequest, res) => {
    try {
      const cartItem = await storage.createCartItem({
        userId: req.user.id,
        serviceId: req.body.serviceId,
        quantity: req.body.quantity || 1,
      });
      res.status(201).json(cartItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.put("/api/cart/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const cartItem = await storage.updateCartItem(parseInt(req.params.id), req.body);
      res.json(cartItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      await storage.deleteCartItem(parseInt(req.params.id));
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  // Promotions routes
  app.get("/api/promotions", async (req, res) => {
    try {
      const promotions = await storage.getActivePromotions();
      res.json(promotions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch promotions" });
    }
  });

  app.post("/api/promotions", authenticate, authorize(['admin', 'superadmin']), async (req: AuthRequest, res) => {
    try {
      const promotion = await storage.createPromotion(req.body);
      res.status(201).json(promotion);
    } catch (error) {
      res.status(500).json({ message: "Failed to create promotion" });
    }
  });

  // Payment Methods routes
  app.get("/api/payment-methods", async (req, res) => {
    try {
      const paymentMethods = await storage.getActivePaymentMethods();
      res.json(paymentMethods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment methods" });
    }
  });

  app.post("/api/payment-methods", authenticate, authorize(['admin', 'superadmin']), async (req: AuthRequest, res) => {
    try {
      const paymentMethod = await storage.createPaymentMethod(req.body);
      res.status(201).json(paymentMethod);
    } catch (error) {
      res.status(500).json({ message: "Failed to create payment method" });
    }
  });

  // Employee Time Logs routes
  app.get("/api/time-logs", authenticate, async (req: AuthRequest, res) => {
    try {
      let timeLogs;
      if (req.user.role === 'employee') {
        timeLogs = await storage.getTimeLogsByEmployee(req.user.id);
      } else {
        timeLogs = await storage.getTimeLogsByEmployee(parseInt(req.query.employeeId as string));
      }
      res.json(timeLogs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch time logs" });
    }
  });

  app.post("/api/time-logs", authenticate, authorize(['employee']), async (req: AuthRequest, res) => {
    try {
      const timeLog = await storage.createEmployeeTimeLog({
        ...req.body,
        employeeId: req.user.id,
      });
      res.status(201).json(timeLog);
    } catch (error) {
      res.status(500).json({ message: "Failed to create time log" });
    }
  });

  app.put("/api/time-logs/:id", authenticate, authorize(['employee']), async (req: AuthRequest, res) => {
    try {
      const timeLog = await storage.updateEmployeeTimeLog(parseInt(req.params.id), req.body);
      res.json(timeLog);
    } catch (error) {
      res.status(500).json({ message: "Failed to update time log" });
    }
  });

  // Invoices routes
  app.get("/api/invoices", authenticate, async (req: AuthRequest, res) => {
    try {
      let invoices;
      if (req.user.role === 'admin' || req.user.role === 'superadmin') {
        invoices = await storage.getAllInvoices();
      } else if (req.user.role === 'employee') {
        invoices = await storage.getInvoicesByEmployee(req.user.id);
      } else {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.post("/api/invoices", authenticate, authorize(['admin', 'superadmin']), async (req: AuthRequest, res) => {
    try {
      const invoice = await storage.createInvoice(req.body);
      res.status(201).json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  // Users management routes
  app.get("/api/users", authenticate, authorize(['admin', 'superadmin']), async (req: AuthRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put("/api/users/:id", authenticate, authorize(['admin', 'superadmin']), async (req: AuthRequest, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { name, email, mobile, role, isVerifiedProvider, isEmailVerified, isMobileVerified } = req.body;
      
      // Validate required fields
      if (!name || !email || !mobile || !role) {
        return res.status(400).json({ message: "Name, email, mobile, and role are required" });
      }
      
      // Validate role
      if (!['user', 'employee', 'admin', 'superadmin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role specified" });
      }
      
      // Check if user exists
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check for email uniqueness (except for current user)
      const emailUser = await storage.getUserByEmail(email);
      if (emailUser && emailUser.id !== userId) {
        return res.status(400).json({ message: "Email already in use by another user" });
      }
      
      // Prepare update data
      const updateData: any = {
        name,
        email,
        mobile,
        role,
        isVerifiedProvider: isVerifiedProvider || false,
        isEmailVerified: isEmailVerified || false,
        isMobileVerified: isMobileVerified || false,
        updatedAt: new Date()
      };
      
      const user = await storage.updateUser(userId, updateData);
      res.json(user);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", authenticate, authorize(['superadmin']), async (req: AuthRequest, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if user exists
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Prevent deletion of current user
      if (userId === req.user!.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      // Delete user (Note: this should cascade delete related data)
      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // User profile update endpoint
  app.put("/api/users/profile", authenticate, async (req: AuthRequest, res) => {
    try {
      const { name, email, mobile, currentPassword, newPassword } = req.body;
      
      // Get current user
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // If changing password, verify current password
      if (newPassword && currentPassword) {
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
          return res.status(400).json({ message: "Current password is incorrect" });
        }
      }

      // Prepare update data
      const updateData: any = { name, email, mobile };
      
      // Hash new password if provided
      if (newPassword) {
        updateData.password = await bcrypt.hash(newPassword, 12);
      }

      const updatedUser = await storage.updateUser(user.id, updateData);

      res.json({ 
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          mobile: updatedUser.mobile,
          role: updatedUser.role,
        }
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Address management endpoints
  app.get("/api/addresses", authenticate, async (req: AuthRequest, res) => {
    try {
      const addresses = await storage.getAddressesByUser(req.user!.id);
      res.json(addresses);
    } catch (error) {
      console.error("Get addresses error:", error);
      res.status(500).json({ message: "Failed to fetch addresses" });
    }
  });

  app.post("/api/addresses", authenticate, async (req: AuthRequest, res) => {
    try {
      const validationResult = secureAddressSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: validationResult.error.errors,
        });
      }

      const addressData = { ...validationResult.data, userId: req.user!.id };
      const address = await storage.createAddress(addressData);
      res.json({ address });
    } catch (error) {
      console.error("Create address error:", error);
      res.status(500).json({ message: "Failed to create address" });
    }
  });

  app.put("/api/addresses/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const validationResult = secureAddressSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: validationResult.error.errors,
        });
      }

      const address = await storage.updateAddress(parseInt(id), validationResult.data);
      res.json({ address });
    } catch (error) {
      console.error("Update address error:", error);
      res.status(500).json({ message: "Failed to update address" });
    }
  });

  app.delete("/api/addresses/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAddress(parseInt(id));
      res.json({ message: "Address deleted successfully" });
    } catch (error) {
      console.error("Delete address error:", error);
      res.status(500).json({ message: "Failed to delete address" });
    }
  });

  // Provider approval routes
  app.get("/api/providers/pending", authenticate, authorize(['admin', 'superadmin']), async (req: AuthRequest, res) => {
    try {
      const pendingProviders = await storage.getUsersByStatusAndRole('pending', 'provider');
      res.json(pendingProviders);
    } catch (error) {
      console.error("Failed to fetch pending providers:", error);
      res.status(500).json({ message: "Failed to fetch pending providers" });
    }
  });

  app.put("/api/providers/:id/approve", authenticate, authorize(['admin', 'superadmin']), async (req: AuthRequest, res) => {
    try {
      const providerId = parseInt(req.params.id);
      const { approved } = req.body; // true for approve, false for reject

      const status = approved ? 'active' : 'rejected';
      const updatedProvider = await storage.updateUser(providerId, { status: status as any });

      // TODO: Send email notification to provider about approval/rejection
      
      res.json({ 
        message: approved ? "Provider approved successfully" : "Provider application rejected",
        provider: updatedProvider 
      });
    } catch (error) {
      console.error("Provider approval error:", error);
      res.status(500).json({ message: "Failed to update provider status" });
    }
  });

  // Seller management routes
  app.get("/api/sellers", authenticate, authorize(['admin', 'superadmin']), async (req: AuthRequest, res) => {
    try {
      const sellers = await storage.getUsersByRole('seller');
      res.json(sellers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sellers" });
    }
  });

  app.get("/api/sellers/stats", authenticate, authorize(['admin', 'superadmin']), async (req: AuthRequest, res) => {
    try {
      const allSellers = await storage.getUsersByRole('seller');
      const stats = {
        totalSellers: allSellers.length,
        activeSellers: allSellers.filter((s: any) => s.status === 'active' && s.isVerifiedSeller).length,
        pendingSellers: allSellers.filter((s: any) => s.status === 'pending').length,
        rejectedSellers: allSellers.filter((s: any) => s.status === 'rejected').length,
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch seller stats" });
    }
  });

  app.put("/api/sellers/:id/approve", authenticate, authorize(['admin', 'superadmin']), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await storage.updateUser(parseInt(id), {
        status: 'active',
        isVerifiedSeller: true,
      });
      res.json({ message: "Seller approved successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to approve seller" });
    }
  });

  app.put("/api/sellers/:id/reject", authenticate, authorize(['admin', 'superadmin']), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await storage.updateUser(parseInt(id), {
        status: 'rejected',
        isVerifiedSeller: false,
      });
      res.json({ message: "Seller rejected successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reject seller" });
    }
  });

  app.put("/api/sellers/:id/status", authenticate, authorize(['admin', 'superadmin']), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await storage.updateUser(parseInt(id), { status });
      res.json({ message: "Seller status updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update seller status" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req) => {
    console.log('Client connected to WebSocket');

    // You can extract user info from auth token here
    const authToken = req.headers.cookie?.split('authToken=')[1]?.split(';')[0];
    let userId: number | undefined;
    let userRole: string | undefined;

    if (authToken) {
      try {
        const decoded = jwt.verify(authToken, JWT_SECRET) as any;
        userId = decoded.userId;
        // You'd need to fetch user role from database here
      } catch (error) {
        console.error('Invalid token in WebSocket connection');
      }
    }

    chatbotService.addClient(ws, userId, userRole);

    ws.on('message', async (message: string) => {
      await chatbotService.handleMessage(ws, message);
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
      chatbotService.removeClient(ws);
    });
  });

  return httpServer;
}
