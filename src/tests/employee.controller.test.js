const request = require("supertest");
const app = require("../app");
const EmployeeService = require("../services/employee.service");
const ActivityService = require("../services/activity.service");
const userService = require("../services/user.service");
const jwt = require("jsonwebtoken");

jest.mock("../services/employee.service");
jest.mock("../services/activity.service");
jest.mock("../services/user.service");
jest.mock("cloudinary").v2;

process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";

describe("Employee Controller", () => {
  let token;

  beforeEach(() => {
    token = jwt.sign(
      { id: 1, email: "test@example.com", peran: "Editor", masjid_id: 1 },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    userService.getById.mockResolvedValue({
      id: 1,
      nama: "Test User",
      email: "test@example.com",
      peran: "Editor",
      masjid_id: 1,
    });

    jest.clearAllMocks();
  });

  describe("GET /api/employee", () => {
    it("should return 200 and all employees with pagination", async () => {
      const mockEmployees = [
        {
          id: 1,
          nama: "Employee 1",
          telepon: "1234567890",
          alamat: "Address 1",
          email: "employee1@example.com",
        },
        {
          id: 2,
          nama: "Employee 2",
          telepon: "0987654321",
          alamat: "Address 2",
          email: "employee2@example.com",
        },
      ];

      const mockTotal = 2;

      EmployeeService.getAllEmployees.mockResolvedValue(mockEmployees);
      EmployeeService.countAllEmployees.mockResolvedValue(mockTotal);

      const res = await request(app)
        .get("/api/employee")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Employees fetched successfully");
      expect(res.body.data).toEqual(mockEmployees);
      expect(res.body.total).toBe(mockTotal);
    });

    it("should handle query parameters correctly", async () => {
      const mockEmployees = [
        {
          id: 1,
          nama: "Employee 1",
          telepon: "1234567890",
        },
      ];

      EmployeeService.getAllEmployees.mockResolvedValue(mockEmployees);
      EmployeeService.countAllEmployees.mockResolvedValue(1);

      const res = await request(app)
        .get(
          "/api/employee?page=2&limit=5&search=Employee&sortBy=nama&sortOrder=ASC&working=true"
        )
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      expect(EmployeeService.getAllEmployees).toHaveBeenCalledWith(
        5,
        5,
        1,
        "Employee",
        "nama",
        "ASC",
        true
      );
    });

    it("should return 500 when service throws an error", async () => {
      EmployeeService.getAllEmployees.mockRejectedValue(
        new Error("Database error")
      );

      const res = await request(app)
        .get("/api/employee")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(500);
    });
  });

  describe("GET /api/employee/:id", () => {
    it("should return 200 and the employee when found", async () => {
      const mockEmployee = {
        id: 1,
        nama: "Test Employee",
        telepon: "1234567890",
        alamat: "Test Address",
        email: "employee@example.com",
        foto: "http://example.com/photo.jpg",
      };

      EmployeeService.getEmployeeById.mockResolvedValue(mockEmployee);

      const res = await request(app)
        .get("/api/employee/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Employee found");
      expect(res.body.data).toEqual(mockEmployee);
    });

    it("should return 404 when employee is not found", async () => {
      EmployeeService.getEmployeeById.mockResolvedValue(null);

      const res = await request(app)
        .get("/api/employee/999")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Employee not found");
    });
  });

  describe("POST /api/employee", () => {
    it("should return 201 for creating a new employee", async () => {
      const employeeData = {
        nama: "New Employee",
        telepon: "1234567890",
        alamat: "New Address",
        email: "new@example.com",
      };

      EmployeeService.createEmployee.mockResolvedValue(1);

      const res = await request(app)
        .post("/api/employee")
        .set("Authorization", `Bearer ${token}`)
        .send(employeeData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Employee created successfully");
      expect(res.body.id).toBe(1);
    });

    it("should return 400 when employee creation fails", async () => {
      const employeeData = {
        nama: "New Employee",
        telepon: "1234567890",
        alamat: "New Address",
        email: "new@example.com",
      };

      EmployeeService.createEmployee.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/employee")
        .set("Authorization", `Bearer ${token}`)
        .send(employeeData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Employee creation failed");
    });

    it("should return 500 when service throws an error", async () => {
      const employeeData = {
        nama: "New Employee",
        telepon: "1234567890",
        alamat: "New Address",
        email: "new@example.com",
      };

      EmployeeService.createEmployee.mockRejectedValue(
        new Error("Database error")
      );

      const res = await request(app)
        .post("/api/employee")
        .set("Authorization", `Bearer ${token}`)
        .send(employeeData);

      expect(res.status).toBe(500);
    });
  });

  describe("PUT /api/employee/:id", () => {
    it("should return 200 when employee is updated successfully", async () => {
      const updateData = {
        nama: "Updated Employee",
        telepon: "9876543210",
        alamat: "Updated Address",
      };

      const mockCurrentEmployee = {
        id: 1,
        nama: "Test Employee",
        telepon: "1234567890",
        alamat: "Test Address",
        email: "employee@example.com",
      };

      EmployeeService.getEmployeeById.mockResolvedValue(mockCurrentEmployee);
      EmployeeService.updateEmployee.mockResolvedValue(true);

      const res = await request(app)
        .put("/api/employee/1")
        .set("Authorization", `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Employee updated successfully");
    });

    it("should return 404 when employee is not found", async () => {
      const updateData = {
        nama: "Updated Employee",
        telepon: "9876543210",
      };

      EmployeeService.getEmployeeById.mockResolvedValue(null);

      const res = await request(app)
        .put("/api/employee/999")
        .set("Authorization", `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Employee not found");
    });

    it("should handle profile photo deletion correctly", async () => {
      const updateData = {
        nama: "Updated Employee",
        deletePhoto: "true",
      };

      const mockCurrentEmployee = {
        id: 1,
        nama: "Test Employee",
        foto: "http://example.com/photo.jpg",
      };

      EmployeeService.getEmployeeById.mockResolvedValue(mockCurrentEmployee);
      EmployeeService.updateEmployee.mockResolvedValue(true);

      const res = await request(app)
        .put("/api/employee/1")
        .set("Authorization", `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(EmployeeService.updateEmployee.mock.calls[0][1]).toHaveProperty(
        "foto",
        null
      );
    });
  });

  describe("DELETE /api/employee/:id", () => {
    it("should return 200 when employee is deleted successfully", async () => {
      const mockEmployee = {
        id: 1,
        nama: "Test Employee",
        foto: null,
      };

      EmployeeService.getEmployeeById.mockResolvedValue(mockEmployee);
      EmployeeService.deleteEmployee.mockResolvedValue(true);

      const res = await request(app)
        .delete("/api/employee/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Employee deleted successfully");
    });

    it("should return 400 when employee deletion fails", async () => {
      const mockEmployee = {
        id: 1,
        nama: "Test Employee",
      };

      EmployeeService.getEmployeeById.mockResolvedValue(mockEmployee);
      EmployeeService.deleteEmployee.mockResolvedValue(false);

      const res = await request(app)
        .delete("/api/employee/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Employee deletion failed");
    });

    it("should return 500 when service throws an error", async () => {
      EmployeeService.getEmployeeById.mockRejectedValue(
        new Error("Database error")
      );

      const res = await request(app)
        .delete("/api/employee/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(500);
    });
  });

  describe("GET /api/employee/activity/:id", () => {
    it("should return 200 and activities for an employee", async () => {
      const mockActivities = [
        {
          id: 1,
          nama_aktivitas: "Activity 1",
          employee_id: 1,
        },
        {
          id: 2,
          nama_aktivitas: "Activity 2",
          employee_id: 1,
        },
      ];

      ActivityService.getActivityByEmployeeId.mockResolvedValue(mockActivities);

      const res = await request(app)
        .get("/api/employee/activity/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Activities fetched successfully");
      expect(res.body.data).toEqual(mockActivities);
    });

    it("should return 404 when no activities found for employee", async () => {
      ActivityService.getActivityByEmployeeId.mockResolvedValue(null);

      const res = await request(app)
        .get("/api/employee/activity/999")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Activities not found");
    });

    it("should return 500 when service throws an error", async () => {
      ActivityService.getActivityByEmployeeId.mockRejectedValue(
        new Error("Database error")
      );

      const res = await request(app)
        .get("/api/employee/activity/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(500);
    });
  });
});
