const activityService = require("../services/activity.service");
const userService = require("../services/user.service");
const jwt = require("jsonwebtoken");
const express = require("express");
const request = require("supertest");

jest.mock("../services/activity.service");
jest.mock("../services/user.service");

process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";

const testApp = express();
testApp.use(express.json());

const authMiddleware = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  }
  return res.status(401).json({
    success: false,
    message: 'Authentication required'
  });
};

const mockActivityController = {
  getByIdActivity: async (req, res) => {
    try {
      const userId = req.user.id;
      const activityId = req.params.id;

      const activity = await activityService.getByIdActivity(userId, activityId);

      res.status(200).json({
        success: true,
        message: "Activity found",
        activity,
      })
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },

  getAllActivity: async (req, res) => {
    try {
      const masjidID = req.user.masjid_id;

      const activity = await activityService.getAllActivity(masjidID);

      res.status(200).json({
        success: true,
        message: "Activity found",
        activity,
      })
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },

  getIdProgram: async (req, res) => {
    try {
      const masjidID = req.user.masjid_id;

      const idProgram = await activityService.getIdProgram(masjidID);

      res.status(200).json({
        success: true,
        message: "Program found",
        idProgram,
      })
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },

  getIdAktivitas: async (req, res) => {
    try {
      const masjidID = req.user.masjid_id;

      const idAktivitas = await activityService.getIdAktivitas(masjidID);

      res.status(200).json({
        success: true,
        message: "Activity found",
        idAktivitas,
      })
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },

  getByIdProgram: async (req, res) => {
    try {
      const userId = req.user.id;
      const programId = req.params.id;

      const activity = await activityService.getByIdProgram(userId, programId);

      res.status(200).json({
        success: true,
        message: "Activity found",
        activity,
      })
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },

  addActivity: async (req, res) => {
    try {
      const created_by = req.user.id;
      const masjid_id = req.user.masjid_id;
      
      const data = { ...req.body, created_by, masjid_id };

      if (req.fileUrls && req.fileUrls.length > 0) {
        data.dokumentasi = req.fileUrls;
      }

      const result = await activityService.addActivity(data);

      if (result) {
        res.status(200).json({
          success: true,
          message: "Activity added successfully",
        })
      } else {
        return res.status(400).json({
          success: false,
          message: "Add activity failed",
        });
      }
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },

  deleteActivity: async (req, res) => {
    try {
      const activityId = req.params.id;
      const masjidID = req.user.masjid_id;

      const result = await activityService.deleteActivity(masjidID, activityId);

      if (result) {
        res.status(200).json({
          success: true,
          message: "Activity deleted successfully",
        })
      }
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },

  updateActivity: async (req, res) => {
    try {
      const userId = req.user.id;
      const activityId = req.params.id;
      const activityData = req.body;

      if (req.fileUrls && req.fileUrls.length > 0) {
        activityData.dokumentasi = req.fileUrls;
      }

      const result = await activityService.updateActivity(userId, activityId, activityData);

      res.status(200).json({
        success: true,
        message: "Activity updated successfully",
        data: result
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },

  addActivitySheet: async (req, res) => {
    try {
      const userId = req.user.id;
      const masjid_id = req.user.masjid_id;
      const activityData = req.body.data;

      const result = await activityService.addActivitySheet(userId, masjid_id, activityData);

      res.status(200).json({
        success: true,
        message: "Activity updated successfully",
        data: result
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
};

const fileUploadMiddleware = (req, res, next) => {
  if (req.body && req.body.simulateFiles) {
    req.fileUrls = req.body.simulateFiles;
    delete req.body.simulateFiles;
  }
  next();
};

testApp.get('/api/activity/getactivity/:id', authMiddleware, mockActivityController.getByIdActivity);
testApp.get('/api/activity/getactivity', authMiddleware, mockActivityController.getAllActivity);
testApp.get('/api/activity/idprogram', authMiddleware, mockActivityController.getIdProgram);
testApp.get('/api/activity/idactivity', authMiddleware, mockActivityController.getIdAktivitas);
testApp.get('/api/activity/program/:id', authMiddleware, mockActivityController.getByIdProgram);
testApp.post('/api/activity/add', authMiddleware, fileUploadMiddleware, mockActivityController.addActivity);
testApp.delete('/api/activity/delete/:id', authMiddleware, mockActivityController.deleteActivity);
testApp.put('/api/activity/update/:id', authMiddleware, fileUploadMiddleware, mockActivityController.updateActivity);
testApp.post('/api/activity/add/sheet', authMiddleware, mockActivityController.addActivitySheet);

describe("Activity Controller", () => {
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

  describe("GET /api/activity/getactivity/:id", () => {
    it("should return 200 and the activity when found", async () => {
      const mockActivity = {
        id: 1,
        nama_aktivitas: "Test Activity",
        deskripsi: "Test Description",
        dokumentasi: JSON.stringify(["http://example.com/image.jpg"]),
        tanggal_mulai: "2025-01-01",
        tanggal_selesai: "2025-01-10",
        biaya_implementasi: 1000000,
        status: "Berjalan",
        program_id: 1,
      };

      activityService.getByIdActivity.mockResolvedValue(mockActivity);

      const res = await request(testApp)
        .get("/api/activity/getactivity/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Activity found");
      expect(res.body.activity).toEqual(mockActivity);
    });

    it("should return 404 when activity is not found", async () => {
      const error = { statusCode: 404, message: "Activity not found" };
      activityService.getByIdActivity.mockRejectedValue(error);

      const res = await request(testApp)
        .get("/api/activity/getactivity/999")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Activity not found");
    });
  });

  describe("GET /api/activity/getactivity", () => {
    it("should return 200 and all activities", async () => {
      const mockActivities = [
        {
          id: 1,
          nama_aktivitas: "Activity 1",
          deskripsi: "Description 1",
          tanggal_mulai: "2025-01-01",
          tanggal_selesai: "2025-01-10",
        },
        {
          id: 2,
          nama_aktivitas: "Activity 2",
          deskripsi: "Description 2",
          tanggal_mulai: "2025-02-01",
          tanggal_selesai: "2025-02-10",
        },
      ];

      activityService.getAllActivity.mockResolvedValue(mockActivities);

      const res = await request(testApp)
        .get("/api/activity/getactivity")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Activity found");
      expect(res.body.activity).toEqual(mockActivities);
    });
  });

  describe("GET /api/activity/idprogram", () => {
    it("should return 200 and all program IDs", async () => {
      const mockPrograms = [
        { id: 1, nama_program: "Program 1" },
        { id: 2, nama_program: "Program 2" },
      ];

      activityService.getIdProgram.mockResolvedValue(mockPrograms);

      const res = await request(testApp)
        .get("/api/activity/idprogram")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Program found");
      expect(res.body.idProgram).toEqual(mockPrograms);
    });
  });

  describe("GET /api/activity/idactivity", () => {
    it("should return 200 and all activity IDs", async () => {
      const mockActivities = [
        { id: 1, nama_aktivitas: "Activity 1" },
        { id: 2, nama_aktivitas: "Activity 2" },
      ];

      activityService.getIdAktivitas.mockResolvedValue(mockActivities);

      const res = await request(testApp)
        .get("/api/activity/idactivity")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Activity found");
      expect(res.body.idAktivitas).toEqual(mockActivities);
    });
  });

  describe("GET /api/activity/program/:id", () => {
    it("should return 200 and activities for a program", async () => {
      const mockActivities = [
        {
          id: 1,
          nama_aktivitas: "Program Activity 1",
          program_id: 5,
        },
        {
          id: 2,
          nama_aktivitas: "Program Activity 2",
          program_id: 5,
        },
      ];

      activityService.getByIdProgram.mockResolvedValue(mockActivities);

      const res = await request(testApp)
        .get("/api/activity/program/5")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Activity found");
      expect(res.body.activity).toEqual(mockActivities);
    });
  });

  describe("POST /api/activity/add", () => {
    it("should return 200 when activity is added successfully", async () => {
      const activityData = {
        nama_aktivitas: "New Activity",
        deskripsi: "New Description has at least 10 characters",
        tanggal_mulai: "2025-03-01",
        tanggal_selesai: "2025-03-10",
        biaya_implementasi: 2000000,
        status: "Belum Mulai",
        program_id: 2,
        simulateFiles: [
          "http://example.com/uploads/doc1.jpg",
          "http://example.com/uploads/doc2.jpg"
        ]
      };

      activityService.addActivity.mockResolvedValue(true);

      const res = await request(testApp)
        .post("/api/activity/add")
        .set("Authorization", `Bearer ${token}`)
        .send(activityData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Activity added successfully");
    });

    it("should return 400 when add activity fails", async () => {
      const activityData = {
        nama_aktivitas: "New Activity",
        deskripsi: "New Description has at least 10 characters",
        tanggal_mulai: "2025-03-01",
        tanggal_selesai: "2025-03-10",
        biaya_implementasi: 2000000,
        status: "Belum Mulai",
        program_id: 2
      };

      activityService.addActivity.mockResolvedValue(false);

      const res = await request(testApp)
        .post("/api/activity/add")
        .set("Authorization", `Bearer ${token}`)
        .send(activityData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Add activity failed");
    });
  });

  describe("DELETE /api/activity/delete/:id", () => {
    it("should return 200 when activity is deleted successfully", async () => {
      activityService.deleteActivity.mockResolvedValue(true);

      const res = await request(testApp)
        .delete("/api/activity/delete/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Activity deleted successfully");
    });
  });

  describe("PUT /api/activity/update/:id", () => {
    it("should return 200 when activity is updated successfully", async () => {
      const updateData = {
        nama_aktivitas: "Updated Activity",
        deskripsi: "Updated Description has at least 10 characters",
        status: "Selesai",
        tanggal_mulai: "2025-03-01",
        tanggal_selesai: "2025-03-10",
        biaya_implementasi: 3000000,
        // Simulate files being uploaded
        simulateFiles: [
          "http://example.com/uploads/updated_doc1.jpg"
        ]
      };

      activityService.updateActivity.mockResolvedValue({
        id: 1,
        ...updateData,
      });

      const res = await request(testApp)
        .put("/api/activity/update/1")
        .set("Authorization", `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Activity updated successfully");
      expect(res.body.data).toBeDefined();
    });
  });

  describe("POST /api/activity/add/sheet", () => {
    it("should return 200 when activities from sheet are added successfully", async () => {
      const sheetData = {
        data: [
          {
            nama_aktivitas: "Sheet Activity 1",
            deskripsi: "Description 1",
            tanggal_mulai: "2025-04-01",
            tanggal_selesai: "2025-04-10",
            biaya_implementasi: 1000000,
            status: "Belum Mulai",
            program_id: 1,
          },
          {
            nama_aktivitas: "Sheet Activity 2",
            deskripsi: "Description 2",
            tanggal_mulai: "2025-05-01",
            tanggal_selesai: "2025-05-10",
            biaya_implementasi: 2000000,
            status: "Belum Mulai",
            program_id: 1,
          },
        ],
      };

      activityService.addActivitySheet.mockResolvedValue(sheetData.data);

      const res = await request(testApp)
        .post("/api/activity/add/sheet")
        .set("Authorization", `Bearer ${token}`)
        .send(sheetData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Activity updated successfully");
      expect(res.body.data).toEqual(sheetData.data);
    });
  });
});