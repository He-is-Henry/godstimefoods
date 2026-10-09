interface Session {
  id: string;
  userId: number;
  deviceInfo: string;
  ipAddress: string;
  location: string;
  currentDevice: boolean;

  createdAt: string;
  updatedAt: string;
}
