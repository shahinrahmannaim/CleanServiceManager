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
      
      // For now, assign to first available employee
      // In production, you'd implement more sophisticated logic
      const availableEmployee = employees[0];
      
      if (availableEmployee) {
        await storage.updateBooking(bookingId, {
          employeeId: availableEmployee.id,
          status: 'confirmed'
        });

        // Notify employee via WebSocket
        this.notifyEmployee(availableEmployee.id, {
          type: 'booking_assignment',
          bookingId,
          message: 'New booking assigned to you'
        });

        // Notify customer
        this.notifyUser(booking.userId, {
          type: 'booking_update',
          bookingId,
          message: 'Your booking has been confirmed and assigned to an employee'
        });
      }
    } catch (error) {
      console.error('Error assigning booking:', error);
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
