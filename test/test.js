const { createUser } = require("../controllers/user");
const User = require('../models/User');

// Mock the User model and its methods
jest.mock('../models/User', () => {
  // Create a mock constructor function
  const mockUserInstance = {
    save: jest.fn().mockResolvedValue(true),
    _id: 'mock-user-id'
  };
  
  // Create a mock constructor that returns the mock instance
  const MockUser = jest.fn(() => mockUserInstance);
  
  // Add static methods to the constructor
  MockUser.findOne = jest.fn();
  
  return MockUser;
});

// Mock other dependencies used in createUser
jest.mock('../helpers/auth', () => ({
  encrypt: jest.fn().mockResolvedValue('encrypted-password'),
  compare: jest.fn()
}));

jest.mock('../helpers/token', () => ({
  generateOTP: jest.fn().mockReturnValue('123456'),
  generateRefreshToken: jest.fn().mockReturnValue('refresh-token'),
  generateToken: jest.fn(),
  decodeToken: jest.fn(),
  generateTempToken: jest.fn()
}));

jest.mock('../helpers/fetchCountries', () => ({
  fetchCountriesData: jest.fn(),
  fetchUniversitiesByCountry: jest.fn().mockResolvedValue([
    { name: 'Test University' }
  ])
}));

jest.mock('../services/email', () => jest.fn().mockResolvedValue(true));

// Set up your test
describe('User Controller', () => {
  let req, res;
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Setup mock request and response
    req = {
      body: {
        userName: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'STUDENT',
        university: 'Test University',
        country: 'Test Country'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn()
    };
    
    // Mock User.findOne to return null (user doesn't exist)
    User.findOne.mockResolvedValue(null);
  });

  test('should create a user successfully', async () => {
    // Call the createUser function
    await createUser(req, res);
    
    // Verify that status and json were called with the right arguments
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        msg: 'account created',
        user: expect.any(Object)
      })
    );
  });
});

