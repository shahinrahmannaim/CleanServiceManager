import { 
  users, categories, services, bookings, payments, paymentMethods, promotions,
  favorites, cart, employeeTimeLogs, invoices, otpCodes, addresses,
  type User, type InsertUser, type Category, type InsertCategory,
  type Service, type InsertService, type Booking, type InsertBooking,
  type Payment, type InsertPayment, type PaymentMethod, type InsertPaymentMethod,
  type Promotion, type InsertPromotion, type Favorite, type InsertFavorite,
  type Cart, type InsertCart, type EmployeeTimeLog, type InsertEmployeeTimeLog,
  type Invoice, type InsertInvoice, type OtpCode, type InsertOtpCode,
  type Address, type InsertAddress
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, or, like, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByMobile(mobile: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  getUsersByStatusAndRole(status: string, role: string): Promise<User[]>;
  
  // Categories
  getCategory(id: number): Promise<Category | undefined>;
  getAllCategories(): Promise<Category[]>;
  getActiveCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  
  // Services
  getService(id: number): Promise<Service | undefined>;
  getAllServices(): Promise<Service[]>;
  getServicesByCategory(categoryId: number): Promise<Service[]>;
  getServicesByProvider(providerId: number): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service>;
  deleteService(id: number): Promise<void>;
  searchServices(query: string): Promise<Service[]>;
  
  // Bookings
  getBooking(id: number): Promise<Booking | undefined>;
  getAllBookings(): Promise<Booking[]>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  getBookingsByEmployee(employeeId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking>;
  deleteBooking(id: number): Promise<void>;
  
  // Payments
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByBooking(bookingId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment>;
  
  // Payment Methods
  getPaymentMethod(id: number): Promise<PaymentMethod | undefined>;
  getAllPaymentMethods(): Promise<PaymentMethod[]>;
  getActivePaymentMethods(): Promise<PaymentMethod[]>;
  createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(id: number, paymentMethod: Partial<InsertPaymentMethod>): Promise<PaymentMethod>;
  deletePaymentMethod(id: number): Promise<void>;
  
  // Promotions
  getPromotion(id: number): Promise<Promotion | undefined>;
  getAllPromotions(): Promise<Promotion[]>;
  getActivePromotions(): Promise<Promotion[]>;
  createPromotion(promotion: InsertPromotion): Promise<Promotion>;
  updatePromotion(id: number, promotion: Partial<InsertPromotion>): Promise<Promotion>;
  deletePromotion(id: number): Promise<void>;
  
  // Favorites
  getFavorite(userId: number, serviceId: number): Promise<Favorite | undefined>;
  getFavoritesByUser(userId: number): Promise<Favorite[]>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(userId: number, serviceId: number): Promise<void>;
  
  // Cart
  getCartItem(userId: number, serviceId: number): Promise<Cart | undefined>;
  getCartByUser(userId: number): Promise<Cart[]>;
  createCartItem(cartItem: InsertCart): Promise<Cart>;
  updateCartItem(id: number, cartItem: Partial<InsertCart>): Promise<Cart>;
  deleteCartItem(id: number): Promise<void>;
  clearCart(userId: number): Promise<void>;
  
  // Employee Time Logs
  getEmployeeTimeLog(id: number): Promise<EmployeeTimeLog | undefined>;
  getTimeLogsByEmployee(employeeId: number): Promise<EmployeeTimeLog[]>;
  getTimeLogsByBooking(bookingId: number): Promise<EmployeeTimeLog[]>;
  createEmployeeTimeLog(timeLog: InsertEmployeeTimeLog): Promise<EmployeeTimeLog>;
  updateEmployeeTimeLog(id: number, timeLog: Partial<InsertEmployeeTimeLog>): Promise<EmployeeTimeLog>;
  deleteEmployeeTimeLog(id: number): Promise<void>;
  
  // Invoices
  getInvoice(id: number): Promise<Invoice | undefined>;
  getAllInvoices(): Promise<Invoice[]>;
  getInvoicesByEmployee(employeeId: number): Promise<Invoice[]>;
  getInvoicesByBooking(bookingId: number): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice>;
  deleteInvoice(id: number): Promise<void>;
  
  // OTP Codes
  getOtpCode(identifier: string, type: string): Promise<OtpCode | undefined>;
  createOtpCode(otpCode: InsertOtpCode): Promise<OtpCode>;
  updateOtpCode(id: number, otpCode: Partial<InsertOtpCode>): Promise<OtpCode>;
  deleteExpiredOtpCodes(): Promise<void>;
  
  // Addresses
  getAddress(id: number): Promise<Address | undefined>;
  getAddressesByUser(userId: number): Promise<Address[]>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: number, address: Partial<InsertAddress>): Promise<Address>;
  deleteAddress(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByMobile(mobile: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.mobile, mobile));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role as any));
  }

  async getUsersByStatusAndRole(status: string, role: string): Promise<User[]> {
    return await db.select().from(users).where(
      and(
        eq(users.status, status as any),
        eq(users.role, role as any)
      )
    ).orderBy(desc(users.createdAt));
  }

  // Categories
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(desc(categories.createdAt));
  }

  async getActiveCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category> {
    const [updatedCategory] = await db.update(categories).set(category).where(eq(categories.id, id)).returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Services
  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async getAllServices(): Promise<Service[]> {
    return await db.select().from(services).orderBy(desc(services.createdAt));
  }

  async getServicesByCategory(categoryId: number): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.categoryId, categoryId));
  }

  async getServicesByProvider(providerId: number): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.sellerId, providerId));
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: number, service: Partial<InsertService>): Promise<Service> {
    const [updatedService] = await db.update(services).set(service).where(eq(services.id, id)).returning();
    return updatedService;
  }

  async deleteService(id: number): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  async searchServices(query: string): Promise<Service[]> {
    return await db.select().from(services).where(
      or(
        like(services.name, `%${query}%`),
        like(services.description, `%${query}%`)
      )
    );
  }

  // Bookings
  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async getAllBookings(): Promise<Booking[]> {
    const bookingsWithUser = await db
      .select({
        id: bookings.id,
        userId: bookings.userId,
        serviceId: bookings.serviceId,
        employeeId: bookings.employeeId,
        address: bookings.address,
        city: bookings.city,
        scheduledDate: bookings.scheduledDate,
        status: bookings.status,
        totalAmount: bookings.totalAmount,
        notes: bookings.notes,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        userName: users.name,
        userEmail: users.email,
        userMobile: users.mobile,
        serviceName: services.name,
        serviceDescription: services.description,
        servicePrice: services.price,
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.userId, users.id))
      .leftJoin(services, eq(bookings.serviceId, services.id))
      .orderBy(desc(bookings.createdAt));

    // Get employee data separately to avoid join conflicts
    const enrichedBookings = await Promise.all(
      bookingsWithUser.map(async (booking) => {
        let employee = null;
        if (booking.employeeId) {
          const [emp] = await db.select().from(users).where(eq(users.id, booking.employeeId));
          if (emp) {
            employee = {
              name: emp.name,
              email: emp.email,
              mobile: emp.mobile,
            };
          }
        }

        return {
          ...booking,
          user: {
            name: booking.userName,
            email: booking.userEmail,
            mobile: booking.userMobile,
          },
          service: {
            name: booking.serviceName,
            description: booking.serviceDescription,
            price: booking.servicePrice,
          },
          employee,
        };
      })
    );

    return enrichedBookings as any;
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.userId, userId));
  }

  async getBookingsByEmployee(employeeId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.employeeId, employeeId));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking> {
    const [updatedBooking] = await db.update(bookings).set(booking).where(eq(bookings.id, id)).returning();
    return updatedBooking;
  }

  async deleteBooking(id: number): Promise<void> {
    await db.delete(bookings).where(eq(bookings.id, id));
  }

  // Payments
  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async getPaymentsByBooking(bookingId: number): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.bookingId, bookingId));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment> {
    const [updatedPayment] = await db.update(payments).set(payment).where(eq(payments.id, id)).returning();
    return updatedPayment;
  }

  // Payment Methods
  async getPaymentMethod(id: number): Promise<PaymentMethod | undefined> {
    const [paymentMethod] = await db.select().from(paymentMethods).where(eq(paymentMethods.id, id));
    return paymentMethod || undefined;
  }

  async getAllPaymentMethods(): Promise<PaymentMethod[]> {
    return await db.select().from(paymentMethods);
  }

  async getActivePaymentMethods(): Promise<PaymentMethod[]> {
    return await db.select().from(paymentMethods).where(eq(paymentMethods.isActive, true));
  }

  async createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const [newPaymentMethod] = await db.insert(paymentMethods).values(paymentMethod).returning();
    return newPaymentMethod;
  }

  async updatePaymentMethod(id: number, paymentMethod: Partial<InsertPaymentMethod>): Promise<PaymentMethod> {
    const [updatedPaymentMethod] = await db.update(paymentMethods).set(paymentMethod).where(eq(paymentMethods.id, id)).returning();
    return updatedPaymentMethod;
  }

  async deletePaymentMethod(id: number): Promise<void> {
    await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
  }

  // Promotions
  async getPromotion(id: number): Promise<Promotion | undefined> {
    const [promotion] = await db.select().from(promotions).where(eq(promotions.id, id));
    return promotion || undefined;
  }

  async getAllPromotions(): Promise<Promotion[]> {
    return await db.select().from(promotions).orderBy(desc(promotions.createdAt));
  }

  async getActivePromotions(): Promise<Promotion[]> {
    const now = new Date();
    return await db.select().from(promotions).where(
      and(
        eq(promotions.isActive, true),
        lte(promotions.startDate, now),
        gte(promotions.endDate, now)
      )
    );
  }

  async createPromotion(promotion: InsertPromotion): Promise<Promotion> {
    const [newPromotion] = await db.insert(promotions).values(promotion).returning();
    return newPromotion;
  }

  async updatePromotion(id: number, promotion: Partial<InsertPromotion>): Promise<Promotion> {
    const [updatedPromotion] = await db.update(promotions).set(promotion).where(eq(promotions.id, id)).returning();
    return updatedPromotion;
  }

  async deletePromotion(id: number): Promise<void> {
    await db.delete(promotions).where(eq(promotions.id, id));
  }

  // Favorites
  async getFavorite(userId: number, serviceId: number): Promise<Favorite | undefined> {
    const [favorite] = await db.select().from(favorites).where(
      and(eq(favorites.userId, userId), eq(favorites.serviceId, serviceId))
    );
    return favorite || undefined;
  }

  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    return await db.select().from(favorites).where(eq(favorites.userId, userId));
  }

  async createFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db.insert(favorites).values(favorite).returning();
    return newFavorite;
  }

  async deleteFavorite(userId: number, serviceId: number): Promise<void> {
    await db.delete(favorites).where(
      and(eq(favorites.userId, userId), eq(favorites.serviceId, serviceId))
    );
  }

  // Cart
  async getCartItem(userId: number, serviceId: number): Promise<Cart | undefined> {
    const [cartItem] = await db.select().from(cart).where(
      and(eq(cart.userId, userId), eq(cart.serviceId, serviceId))
    );
    return cartItem || undefined;
  }

  async getCartByUser(userId: number): Promise<Cart[]> {
    return await db.select().from(cart).where(eq(cart.userId, userId));
  }

  async createCartItem(cartItem: InsertCart): Promise<Cart> {
    const [newCartItem] = await db.insert(cart).values(cartItem).returning();
    return newCartItem;
  }

  async updateCartItem(id: number, cartItem: Partial<InsertCart>): Promise<Cart> {
    const [updatedCartItem] = await db.update(cart).set(cartItem).where(eq(cart.id, id)).returning();
    return updatedCartItem;
  }

  async deleteCartItem(id: number): Promise<void> {
    await db.delete(cart).where(eq(cart.id, id));
  }

  async clearCart(userId: number): Promise<void> {
    await db.delete(cart).where(eq(cart.userId, userId));
  }

  // Employee Time Logs
  async getEmployeeTimeLog(id: number): Promise<EmployeeTimeLog | undefined> {
    const [timeLog] = await db.select().from(employeeTimeLogs).where(eq(employeeTimeLogs.id, id));
    return timeLog || undefined;
  }

  async getTimeLogsByEmployee(employeeId: number): Promise<EmployeeTimeLog[]> {
    return await db.select().from(employeeTimeLogs).where(eq(employeeTimeLogs.employeeId, employeeId));
  }

  async getTimeLogsByBooking(bookingId: number): Promise<EmployeeTimeLog[]> {
    return await db.select().from(employeeTimeLogs).where(eq(employeeTimeLogs.bookingId, bookingId));
  }

  async createEmployeeTimeLog(timeLog: InsertEmployeeTimeLog): Promise<EmployeeTimeLog> {
    const [newTimeLog] = await db.insert(employeeTimeLogs).values(timeLog).returning();
    return newTimeLog;
  }

  async updateEmployeeTimeLog(id: number, timeLog: Partial<InsertEmployeeTimeLog>): Promise<EmployeeTimeLog> {
    const [updatedTimeLog] = await db.update(employeeTimeLogs).set(timeLog).where(eq(employeeTimeLogs.id, id)).returning();
    return updatedTimeLog;
  }

  async deleteEmployeeTimeLog(id: number): Promise<void> {
    await db.delete(employeeTimeLogs).where(eq(employeeTimeLogs.id, id));
  }

  // Invoices
  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }

  async getAllInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  async getInvoicesByEmployee(employeeId: number): Promise<Invoice[]> {
    return await db.select().from(invoices).where(eq(invoices.employeeId, employeeId));
  }

  async getInvoicesByBooking(bookingId: number): Promise<Invoice[]> {
    return await db.select().from(invoices).where(eq(invoices.bookingId, bookingId));
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }

  async updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice> {
    const [updatedInvoice] = await db.update(invoices).set(invoice).where(eq(invoices.id, id)).returning();
    return updatedInvoice;
  }

  async deleteInvoice(id: number): Promise<void> {
    await db.delete(invoices).where(eq(invoices.id, id));
  }

  // OTP Codes
  async getOtpCode(identifier: string, type: string): Promise<OtpCode | undefined> {
    const [otpCode] = await db.select().from(otpCodes).where(
      and(
        eq(otpCodes.identifier, identifier),
        eq(otpCodes.type, type),
        eq(otpCodes.isUsed, false),
        gte(otpCodes.expiresAt, new Date())
      )
    );
    return otpCode || undefined;
  }

  async createOtpCode(otpCode: InsertOtpCode): Promise<OtpCode> {
    const [newOtpCode] = await db.insert(otpCodes).values(otpCode).returning();
    return newOtpCode;
  }

  async updateOtpCode(id: number, otpCode: Partial<InsertOtpCode>): Promise<OtpCode> {
    const [updatedOtpCode] = await db.update(otpCodes).set(otpCode).where(eq(otpCodes.id, id)).returning();
    return updatedOtpCode;
  }

  async deleteExpiredOtpCodes(): Promise<void> {
    await db.delete(otpCodes).where(or(
      eq(otpCodes.isUsed, true),
      lte(otpCodes.expiresAt, new Date())
    ));
  }

  // Address methods
  async getAddress(id: number): Promise<Address | undefined> {
    const [address] = await db.select().from(addresses).where(eq(addresses.id, id));
    return address || undefined;
  }

  async getAddressesByUser(userId: number): Promise<Address[]> {
    return await db.select().from(addresses).where(eq(addresses.userId, userId));
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    const [newAddress] = await db.insert(addresses).values(address).returning();
    return newAddress;
  }

  async updateAddress(id: number, address: Partial<InsertAddress>): Promise<Address> {
    const [updatedAddress] = await db.update(addresses).set(address).where(eq(addresses.id, id)).returning();
    return updatedAddress;
  }

  async deleteAddress(id: number): Promise<void> {
    await db.delete(addresses).where(eq(addresses.id, id));
  }
}

export const storage = new DatabaseStorage();
