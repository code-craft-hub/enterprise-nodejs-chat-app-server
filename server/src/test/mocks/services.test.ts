import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Example service to test
class UserService {
  private users: any[] = [];

  async createUser(userData: { name: string; email: string }) {
    const user = {
      id: Date.now(),
      ...userData,
      createdAt: new Date().toISOString(),
    };
    this.users.push(user);
    return user;
  }

  async getUserById(id: number) {
    return this.users.find((user) => user.id === id);
  }

  async getAllUsers() {
    return this.users;
  }

  async deleteUser(id: number) {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) {
      throw new Error("User not found");
    }
    return this.users.splice(index, 1)[0];
  }
}

// External service mock
class EmailService {
  async sendWelcomeEmail(email: string, name: string) {
    // Simulate external API call
    console.log(`Sending welcome email to ${email}`);
    return { success: true, messageId: "msg-123" };
  }
}

describe("UserService with Mocks", () => {
  let userService: UserService;
  let emailService: EmailService;

  beforeEach(() => {
    userService = new UserService();
    emailService = new EmailService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("User CRUD Operations", () => {
    it("should create user successfully", async () => {
      const userData = { name: "John Doe", email: "john@example.com" };
      const user = await userService.createUser(userData);

      expect(user).toMatchObject({
        id: expect.any(Number),
        name: userData.name,
        email: userData.email,
        createdAt: expect.any(String),
      });
    });

    it("should retrieve user by ID", async () => {
      const userData = { name: "Jane Doe", email: "jane@example.com" };
      const createdUser = await userService.createUser(userData);

      const foundUser = await userService.getUserById(createdUser.id);

      expect(foundUser).toEqual(createdUser);
    });

    it("should return undefined for non-existent user", async () => {
      const user = await userService.getUserById(999);
      expect(user).toBeUndefined();
    });

    it("should get all users", async () => {
      await userService.createUser({ name: "User 1", email: "user1@test.com" });
      await userService.createUser({ name: "User 2", email: "user2@test.com" });

      const users = await userService.getAllUsers();

      expect(users).toHaveLength(2);
      expect(users[0].name).toBe("User 1");
      expect(users[1].name).toBe("User 2");
    });

    it("should delete user successfully", async () => {
      const user = await userService.createUser({
        name: "Delete Me",
        email: "delete@test.com",
      });

      const deletedUser = await userService.deleteUser(user.id);

      expect(deletedUser).toEqual(user);

      const remainingUsers = await userService.getAllUsers();
      expect(remainingUsers).toHaveLength(0);
    });

    it("should throw error when deleting non-existent user", async () => {
      await expect(userService.deleteUser(999)).rejects.toThrow(
        "User not found"
      );
    });
  });

  describe("Email Service Mocking", () => {
    it("should mock email service successfully", async () => {
      // Spy on the method
      const sendEmailSpy = vi.spyOn(emailService, "sendWelcomeEmail");
      sendEmailSpy.mockResolvedValue({
        success: true,
        messageId: "mocked-123",
      });

      const result = await emailService.sendWelcomeEmail(
        "test@example.com",
        "Test User"
      );

      expect(sendEmailSpy).toHaveBeenCalledWith(
        "test@example.com",
        "Test User"
      );
      expect(result).toEqual({ success: true, messageId: "mocked-123" });
    });

    it("should mock email service failure", async () => {
      const sendEmailSpy = vi.spyOn(emailService, "sendWelcomeEmail");
      sendEmailSpy.mockRejectedValue(new Error("Email service unavailable"));

      await expect(
        emailService.sendWelcomeEmail("test@example.com", "Test User")
      ).rejects.toThrow("Email service unavailable");

      expect(sendEmailSpy).toHaveBeenCalledOnce();
    });
  });

  describe("Timer Mocks", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should mock setTimeout", async () => {
      const callback = vi.fn();

      setTimeout(callback, 1000);

      expect(callback).not.toHaveBeenCalled();

      // Fast-forward time
      vi.advanceTimersByTime(1000);

      expect(callback).toHaveBeenCalledOnce();
    });

    it("should mock Date.now()", () => {
      const mockDate = new Date("2024-01-01T00:00:00Z");
      vi.setSystemTime(mockDate);

      expect(Date.now()).toBe(mockDate.getTime());

      // Advance time
      vi.advanceTimersByTime(5000);
      expect(Date.now()).toBe(mockDate.getTime() + 5000);
    });
  });

describe('Module Mocks', () => {
  // it('should mock external modules', async () => {
  //   // Mock the entire fs/promises module before importing
  //   vi.mock('fs/promises', () => ({
  //     readFile: vi.fn().mockResolvedValue('mocked file content'),
  //     writeFile: vi.fn().mockResolvedValue(undefined),
  //     // Add other methods as needed
  //   }));

  //   // Now import the mocked module
  //   const fs = await import('fs/promises');
    
  //   // Use the mocked function
  //   const content = await fs.readFile('test.txt', 'utf-8');
    
  //   expect(content).toBe('mocked file content');
  //   expect(fs.readFile).toHaveBeenCalledWith('test.txt', 'utf-8');
    
  //   // Clean up the mock
  //   vi.unmock('fs/promises');
  // });

  it('should mock external modules with vi.doMock for dynamic mocking', async () => {
    // Alternative approach using vi.doMock for more control
    vi.doMock('fs/promises', () => ({
      readFile: vi.fn().mockResolvedValue('dynamic mock content'),
      writeFile: vi.fn(),
    }));

    // Import after mocking
    const { readFile } = await import('fs/promises');
    
    const content = await readFile('dynamic-test.txt', 'utf-8');
    
    expect(content).toBe('dynamic mock content');
    expect(readFile).toHaveBeenCalledWith('dynamic-test.txt', 'utf-8');
    
    // Clean up
    vi.doUnmock('fs/promises');
  });

  // it('should mock with factory function for complex scenarios', async () => {
  //   const mockReadFile = vi.fn();
    
  //   vi.mock('fs/promises', () => ({
  //     readFile: mockReadFile,
  //   }));

  //   // Configure the mock behavior
  //   mockReadFile
  //     .mockResolvedValueOnce('first call')
  //     .mockResolvedValueOnce('second call')
  //     .mockRejectedValueOnce(new Error('File not found'));

  //   const fs = await import('fs/promises');

  //   // Test multiple calls
  //   expect(await fs.readFile('file1.txt')).toBe('first call');
  //   expect(await fs.readFile('file2.txt')).toBe('second call');
    
  //   // Test error case
  //   await expect(fs.readFile('missing.txt')).rejects.toThrow('File not found');
    
  //   expect(mockReadFile).toHaveBeenCalledTimes(3);
    
  //   vi.unmock('fs/promises');
  // });

  it('should mock environment variables', () => {
    const originalEnv = process.env.NODE_ENV;
    
    process.env.NODE_ENV = 'test';
    expect(process.env.NODE_ENV).toBe('test');
    
    // Restore
    process.env.NODE_ENV = originalEnv;
  });

  it('should mock environment variables with vi.stubEnv', () => {
    // Better approach using Vitest's built-in env stubbing
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('API_URL', 'https://api.example.com');
    
    expect(process.env.NODE_ENV).toBe('production');
    expect(process.env.API_URL).toBe('https://api.example.com');
    
    // Clean up automatically handled by Vitest
    vi.unstubAllEnvs();
  });
});
});
