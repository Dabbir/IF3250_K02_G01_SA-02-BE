const request = require("supertest");
const app = require("../app");
const masjidService = require("../services/masjid.service");
const userService = require("../services/user.service");
const jwt = require("jsonwebtoken");

jest.mock("../services/masjid.service");
jest.mock("../services/user.service");

process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";

describe("Masjid Controller", () => {
  let adminToken, editorToken;

  beforeEach(() => {
    adminToken = jwt.sign(
      { id: 1, email: "admin@example.com", peran: "Admin", masjid_id: null },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    editorToken = jwt.sign(
      { id: 2, email: "editor@example.com", peran: "Editor", masjid_id: 1 },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    userService.getById.mockImplementation((id) => {
      if (id === 1) {
        return Promise.resolve({
          id: 1,
          nama: "Admin User",
          email: "admin@example.com",
          peran: "Admin",
          masjid_id: null,
        });
      } else if (id === 2) {
        return Promise.resolve({
          id: 2,
          nama: "Editor User",
          email: "editor@example.com",
          peran: "Editor",
          masjid_id: 1,
        });
      }
      return Promise.resolve(null);
    });

    jest.clearAllMocks();
  });

  describe("GET /api/masjid", () => {
    it("should return 200 and all masjids", async () => {
      const mockMasjids = [
        {
          id: 1,
          nama_masjid: "Masjid 1",
          alamat: "Address 1",
        },
        {
          id: 2,
          nama_masjid: "Masjid 2",
          alamat: "Address 2",
        },
      ];

      masjidService.getAllMasjids.mockResolvedValue(mockMasjids);

      const res = await request(app).get("/api/masjid");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Masjids retrieved successfully");
      expect(res.body.data).toEqual(mockMasjids);
    });

    it("should return 500 when service throws an error", async () => {
      masjidService.getAllMasjids.mockRejectedValue(
        new Error("Database error")
      );

      const res = await request(app).get("/api/masjid");

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Internal server error");
    });
  });

  describe("GET /api/masjid/:id", () => {
    it("should return 200 and the masjid when found", async () => {
      const mockMasjid = {
        id: 1,
        nama_masjid: "Test Masjid",
        alamat: "Test Address",
        kota: "Test City",
        provinsi: "Test Province",
      };

      masjidService.getMasjidById.mockResolvedValue(mockMasjid);

      const res = await request(app).get("/api/masjid/1");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Masjid retrieved successfully");
      expect(res.body.data).toEqual(mockMasjid);
    });

    it("should return 500 when ID is not provided", async () => {
      const res = await request(app).get("/api/masjid/");

      expect(res.status).toBe(500);
    });

    it("should return 404 when masjid is not found", async () => {
      masjidService.getMasjidById.mockRejectedValue({
        statusCode: 404,
        message: "Masjid not found",
      });

      const res = await request(app).get("/api/masjid/999");

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Masjid not found");
    });
  });

  describe("GET /api/masjid/search", () => {
    it("should return 200 and masjids matching search criteria", async () => {
      const mockMasjids = [
        {
          id: 1,
          nama_masjid: "Masjid Al-Falah",
          alamat: "Jalan Test 1",
        },
        {
          id: 2,
          nama_masjid: "Masjid Al-Falah Pusat",
          alamat: "Jalan Test 2",
        },
      ];

      masjidService.searchMasjidsByName.mockResolvedValue(mockMasjids);

      const res = await request(app).get("/api/masjid/search?name=Al-Falah");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Masjids search completed successfully");
      expect(res.body.data).toEqual(mockMasjids);
    });

    it("should return 400 when name parameter is missing", async () => {
      const res = await request(app).get("/api/masjid/search");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Name parameter is required for search");
    });
  });

  describe("POST /api/masjid", () => {
    it("should return 201 when masjid is created successfully", async () => {
      const masjidData = {
        nama_masjid: "New Masjid",
        alamat: "New Address",
        kota: "New City",
        provinsi: "New Province",
      };

      const mockCreatedMasjid = {
        id: 3,
        ...masjidData,
      };

      masjidService.createMasjid.mockResolvedValue(mockCreatedMasjid);

      const res = await request(app)
        .post("/api/masjid")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(masjidData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Masjid created successfully");
      expect(res.body.data).toEqual(mockCreatedMasjid);
    });

    it("should return 400 when required fields are missing", async () => {
      const invalidData = {
      };

      const res = await request(app)
        .post("/api/masjid")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Nama masjid and alamat are required");
    });

    it("should return 401 when user is not authenticated", async () => {
      const masjidData = {
        nama_masjid: "New Masjid",
        alamat: "New Address",
      };

      const res = await request(app).post("/api/masjid").send(masjidData);

      expect(res.status).toBe(401);
    });

    it("should return 403 when user is not an admin", async () => {
      const masjidData = {
        nama_masjid: "New Masjid",
        alamat: "New Address",
      };

      const res = await request(app)
        .post("/api/masjid")
        .set("Authorization", `Bearer ${editorToken}`)
        .send(masjidData);

      expect(res.status).toBe(403);
    });
  });

  describe("PUT /api/masjid/:id", () => {
    it("should return 200 when masjid is updated successfully", async () => {
      const updateData = {
        nama_masjid: "Updated Masjid",
        alamat: "Updated Address",
      };

      const mockUpdatedMasjid = {
        id: 1,
        ...updateData,
      };

      masjidService.updateMasjid.mockResolvedValue(mockUpdatedMasjid);

      const res = await request(app)
        .put("/api/masjid/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Masjid updated successfully");
      expect(res.body.data).toEqual(mockUpdatedMasjid);
    });

    it("should return 404 when ID is not provided", async () => {
      const updateData = {
        nama_masjid: "Updated Masjid",
        alamat: "Updated Address",
      };

      const res = await request(app)
        .put("/api/masjid/")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.status).toBe(404);
    });

    it("should return 404 when masjid is not found", async () => {
      const updateData = {
        nama_masjid: "Updated Masjid",
        alamat: "Updated Address",
      };

      masjidService.updateMasjid.mockRejectedValue({
        statusCode: 404,
        message: "Masjid not found",
      });

      const res = await request(app)
        .put("/api/masjid/999")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Masjid not found");
    });
  });

  describe("DELETE /api/masjid/:id", () => {
    it("should return 200 when masjid is deleted successfully", async () => {
      masjidService.deleteMasjid.mockResolvedValue(true);

      const res = await request(app)
        .delete("/api/masjid/1")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Masjid deleted successfully");
    });

    it("should return 404 when ID is not provided", async () => {
      const res = await request(app)
        .delete("/api/masjid/")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it("should return 404 when masjid is not found", async () => {
      masjidService.deleteMasjid.mockRejectedValue({
        statusCode: 404,
        message: "Masjid not found",
      });

      const res = await request(app)
        .delete("/api/masjid/999")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Masjid not found");
    });
  });

  describe("GET /api/masjid/:id/editors", () => {
    it("should return 200 and editors for a masjid", async () => {
      const mockEditors = [
        {
          id: 2,
          nama: "Editor 1",
          email: "editor1@example.com",
        },
        {
          id: 3,
          nama: "Editor 2",
          email: "editor2@example.com",
        },
      ];

      masjidService.getEditorsByMasjidId.mockResolvedValue(mockEditors);

      const res = await request(app)
        .get("/api/masjid/1/editors")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Editors retrieved successfully");
      expect(res.body.data).toEqual(mockEditors);
    });

    it("should return 404 when ID is not provided", async () => {
      const res = await request(app)
        .get("/api/masjid//editors")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it("should return 401 when user is not authenticated", async () => {
      const res = await request(app).get("/api/masjid/1/editors");

      expect(res.status).toBe(401);
    });

    it("should return 403 when user is not an admin", async () => {
      const res = await request(app)
        .get("/api/masjid/1/editors")
        .set("Authorization", `Bearer ${editorToken}`);

      expect(res.status).toBe(403);
    });
  });
});
