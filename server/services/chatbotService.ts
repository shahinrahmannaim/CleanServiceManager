import { storage } from '../storage';
import { WebSocket } from 'ws';

interface ConnectedClient {
  ws: WebSocket;
  userId?: number;
  userRole?: string;
}

class ChatbotService {
  private clients: Map<WebSocket, ConnectedClient> = new Map();

  addClient(ws: WebSocket, userId?: number, userRole?: string) {
    this.clients.set(ws, { ws, userId, userRole });
  }

  removeClient(ws: WebSocket) {
    this.clients.delete(ws);
  }

  async assignBookingToEmployee(bookingId: number): Promise<void> {
    try {
      const booking = await storage.getBooking(bookingId);
      if (!booking) return;

      // Find available employees
      const employees = await storage.getUsersByRole('employee');
      
      if (employees.length === 0) {
        console.log('No employees available for assignment');
        return;
      }

      // Enhanced auto-assignment logic
      const availableEmployee = await this.findBestEmployee(booking, employees);
      
      if (availableEmployee) {
        await storage.updateBooking(bookingId, {
          employeeId: availableEmployee.id,
          status: 'confirmed'
        });

        // Notify employee via WebSocket
        this.notifyEmployee(availableEmployee.id, {
          type: 'booking_assignment',
          bookingId,
          message: 'New booking assigned to you',
          bookingDetails: {
            service: booking.serviceId,
            scheduledDate: booking.scheduledDate,
            address: booking.address,
            city: booking.city
          }
        });

        // Notify customer
        this.notifyUser(booking.userId, {
          type: 'booking_update',
          bookingId,
          message: 'Your booking has been confirmed and assigned to an employee',
          employeeName: availableEmployee.name
        });

        console.log(`Booking ${bookingId} assigned to employee ${availableEmployee.name}`);
      } else {
        console.log('No suitable employee found for booking assignment');
      }
    } catch (error) {
      console.error('Error assigning booking:', error);
    }
  }

  // Enhanced employee selection logic
  private async findBestEmployee(booking: any, employees: any[]): Promise<any> {
    try {
      // Get current bookings for each employee on the scheduled date
      const scheduledDate = new Date(booking.scheduledDate);
      const startOfDay = new Date(scheduledDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(scheduledDate);
      endOfDay.setHours(23, 59, 59, 999);

      const employeeWorkloads = await Promise.all(
        employees.map(async (employee) => {
          const bookingsOnDate = await storage.getBookingsByEmployee(employee.id);
          const sameDayBookings = bookingsOnDate.filter(b => {
            const bDate = new Date(b.scheduledDate);
            return bDate >= startOfDay && bDate <= endOfDay && 
                   ['confirmed', 'in_progress'].includes(b.status);
          });

          return {
            employee,
            workload: sameDayBookings.length,
            lastBookingTime: sameDayBookings.length > 0 ? 
              Math.max(...sameDayBookings.map(b => new Date(b.scheduledDate).getTime())) : 0
          };
        })
      );

      // Sort by workload (ascending), then by availability
      employeeWorkloads.sort((a, b) => {
        if (a.workload !== b.workload) {
          return a.workload - b.workload; // Less workload first
        }
        return a.lastBookingTime - b.lastBookingTime; // Earlier last booking first
      });

      // Return the employee with least workload
      return employeeWorkloads[0]?.employee || employees[0];
    } catch (error) {
      console.error('Error in finding best employee:', error);
      // Fallback to round-robin or first available
      return employees[0];
    }
  }

  private notifyUser(userId: number, message: any) {
    for (const [ws, client] of this.clients) {
      if (client.userId === userId && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    }
  }

  private notifyEmployee(employeeId: number, message: any) {
    for (const [ws, client] of this.clients) {
      if (client.userId === employeeId && client.userRole === 'employee' && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    }
  }

  async handleMessage(ws: WebSocket, message: string) {
    try {
      const data = JSON.parse(message);
      const client = this.clients.get(ws);

      if (!client) return;

      switch (data.type) {
        case 'auto_assign_booking':
          await this.assignBookingToEmployee(data.bookingId);
          break;
        case 'chat_message':
          // Handle chat messages between customer and employee
          this.handleChatMessage(client, data);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  private handleChatMessage(client: ConnectedClient, data: any) {
    // Implement chat message handling logic
    // This would route messages between customers and employees
    console.log('Chat message:', data);
  }
}

export const chatbotService = new ChatbotService();
