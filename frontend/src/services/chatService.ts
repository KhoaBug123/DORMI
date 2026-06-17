import * as signalR from '@microsoft/signalr';

class ChatService {
  private connection: signalR.HubConnection | null = null;
  private isMockMode = false;

  public async connect(token: string): Promise<boolean> {
    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl('http://localhost:5000/chathub', {
          accessTokenFactory: () => token
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      await this.connection.start();
      this.isMockMode = false;
      console.log('SignalR connected successfully.');
      return true;
    } catch (err) {
      console.error('Failed to connect to SignalR chathub:', err);
      this.isMockMode = false;
      return false;
    }
  }

  public disconnect() {
    if (this.connection) {
      this.connection.stop();
    }
  }

  public async sendMessageToServer(receiverId: string, message: string): Promise<boolean> {
    if (this.isMockMode || !this.connection) {
      // Chạy offline mock mode
      return false;
    }

    try {
      await this.connection.invoke('SendMessage', receiverId, message);
      return true;
    } catch (err) {
      console.error('Failed to send message via SignalR:', err);
      return false;
    }
  }

  public registerMessageReceived(callback: (senderId: string, message: string) => void) {
    if (this.connection) {
      this.connection.on('ReceiveMessage', (senderId: string, message: string) => {
        callback(senderId, message);
      });
    }
  }
}

export const chatService = new ChatService();
export type { ChatService };
