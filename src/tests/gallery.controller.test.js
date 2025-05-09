const request = require("supertest");
const app = require("../app");
const activityService = require("../services/activity.service");
const userService = require("../services/user.service");
const jwt = require("jsonwebtoken");

jest.mock("../services/activity.service");
jest.mock("../services/user.service");

process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";

describe("Gallery Controller", () => {
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

  describe("GET /api/gallery", () => {
    it("should return 200 and all gallery items", async () => {
      const mockActivities = [
        {
          id: 1,
          nama_aktivitas: "Activity 1",
          deskripsi: "Description 1",
          dokumentasi: JSON.stringify([
            "http://example.com/img1.jpg",
            "http://example.com/img2.jpg",
          ]),
          tanggal_mulai: "2025-01-01",
        },
        {
          id: 2,
          nama_aktivitas: "Activity 2",
          deskripsi: "Description 2",
          dokumentasi: JSON.stringify(["http://example.com/img3.jpg"]),
          tanggal_mulai: "2025-02-01",
        },
      ];

      activityService.getAllActivity.mockResolvedValue(mockActivities);

      const res = await request(app)
        .get("/api/gallery")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Gallery fetched successfully");
      expect(res.body.data).toHaveLength(3);
    });

    it("should handle activities with no documentation", async () => {
      const mockActivities = [
        {
          id: 1,
          nama_aktivitas: "Activity 1",
          deskripsi: "Description 1",
          dokumentasi: null,
          tanggal_mulai: "2025-01-01",
        },
        {
          id: 2,
          nama_aktivitas: "Activity 2",
          deskripsi: "Description 2",
          dokumentasi: "",
          tanggal_mulai: "2025-02-01",
        },
      ];

      activityService.getAllActivity.mockResolvedValue(mockActivities);

      const res = await request(app)
        .get("/api/gallery")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
    });

    it("should return 500 when service throws an error", async () => {
      activityService.getAllActivity.mockRejectedValue(
        new Error("Database error")
      );

      const res = await request(app)
        .get("/api/gallery")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Database error");
    });
  });

  describe("GET /api/gallery/paginated", () => {
    it("should return 200 and paginated gallery items", async () => {
      const mockActivities = [
        {
          id: 1,
          nama_aktivitas: "Activity 1",
          deskripsi: "Description 1",
          dokumentasi: JSON.stringify([
            "http://example.com/img1.jpg",
            "http://example.com/img2.jpg",
          ]),
          tanggal_mulai: "2025-01-01",
        },
        {
          id: 2,
          nama_aktivitas: "Activity 2",
          deskripsi: "Description 2",
          dokumentasi: JSON.stringify([
            "http://example.com/img3.jpg",
            "http://example.com/img4.jpg",
            "http://example.com/img5.jpg",
          ]),
          tanggal_mulai: "2025-02-01",
        },
      ];

      activityService.getAllActivity.mockResolvedValue(mockActivities);

      const res = await request(app)
        .get("/api/gallery/paginated?page=1&limit=2")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Gallery (paginated) fetched successfully");
      expect(res.body.data).toHaveLength(2);
      expect(res.body.total).toBe(5);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(2);
    });

    it("should handle pagination correctly", async () => {
      const mockActivities = [
        {
          id: 1,
          nama_aktivitas: "Activity 1",
          deskripsi: "Description 1",
          dokumentasi: JSON.stringify([
            "http://example.com/img1.jpg",
            "http://example.com/img2.jpg",
          ]),
          tanggal_mulai: "2025-01-01",
        },
        {
          id: 2,
          nama_aktivitas: "Activity 2",
          deskripsi: "Description 2",
          dokumentasi: JSON.stringify([
            "http://example.com/img3.jpg",
            "http://example.com/img4.jpg",
            "http://example.com/img5.jpg",
          ]),
          tanggal_mulai: "2025-02-01",
        },
      ];

      activityService.getAllActivity.mockResolvedValue(mockActivities);

      const res = await request(app)
        .get("/api/gallery/paginated?page=2&limit=3")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.page).toBe(2);
      expect(res.body.limit).toBe(3);
    });
  });

  describe("GET /api/gallery/:id", () => {
    it("should return 200 and gallery items for a specific activity", async () => {
      const mockActivity = {
        id: 1,
        nama_aktivitas: "Test Activity",
        deskripsi: "Test Description",
        dokumentasi: JSON.stringify([
          "http://example.com/img1.jpg",
          "http://example.com/img2.jpg",
        ]),
        tanggal_mulai: "2025-01-01",
      };

      activityService.getByIdActivity.mockResolvedValue(mockActivity);

      const res = await request(app)
        .get("/api/gallery/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Activity gallery fetched successfully");
      expect(res.body.data).toHaveLength(2);
    });

    it("should handle activity with no documentation", async () => {
      const mockActivity = {
        id: 1,
        nama_aktivitas: "Test Activity",
        deskripsi: "Test Description",
        dokumentasi: null,
        tanggal_mulai: "2025-01-01",
      };

      activityService.getByIdActivity.mockResolvedValue(mockActivity);

      const res = await request(app)
        .get("/api/gallery/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
    });

    it("should return 404 when activity is not found", async () => {
      activityService.getByIdActivity.mockRejectedValue({
        statusCode: 404,
        message: "Activity not found",
      });

      const res = await request(app)
        .get("/api/gallery/999")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Activity not found");
    });
  });
});
