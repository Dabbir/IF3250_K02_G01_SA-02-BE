// models/access.model.js
const { pool } = require("../config/db.config");

class AccessModel {
  async getPendingEditors() {
    try {
      const [rows] = await pool.query(`
        SELECT p.*, m.nama_masjid 
        FROM pengguna p 
        LEFT JOIN masjid m ON p.masjid_id = m.id 
        WHERE p.peran = 'Editor' AND p.status = 'Pending'
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  async updateUserStatus(userId, status) {
    try {
      const [result] = await pool.query(
        "UPDATE pengguna SET status = ? WHERE id = ? AND peran = 'Editor'",
        [status, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  async requestViewerAccess(viewerId, masjidId) {
    try {
      const [editors] = await pool.query(
        "SELECT id FROM pengguna WHERE masjid_id = ? AND peran = 'Editor' AND status = 'Approved' LIMIT 1",
        [masjidId]
      );
      
      if (editors.length === 0) {
        throw new Error("No editors found for this masjid");
      }
      
      const granterId = editors[0].id;
      
      const [existingRequest] = await pool.query(
        "SELECT * FROM viewer_access WHERE viewer_id = ? AND masjid_id = ?",
        [viewerId, masjidId]
      );
      
      if (existingRequest.length > 0) {
        if (existingRequest[0].status === 'Approved') {
          throw new Error("You already have access to this masjid");
        } else if (existingRequest[0].status === 'Pending') {
          throw new Error("Your access request is already pending");
        } else {
          const [updateResult] = await pool.query(
            "UPDATE viewer_access SET status = 'Pending', granted_by = ? WHERE viewer_id = ? AND masjid_id = ?",
            [granterId, viewerId, masjidId]
          );
          
          return updateResult.affectedRows > 0;
        }
      } else {
        const [insertResult] = await pool.query(
          "INSERT INTO viewer_access (viewer_id, masjid_id, granted_by, status) VALUES (?, ?, ?, 'Pending')",
          [viewerId, masjidId, granterId]
        );
        
        return insertResult.insertId;
      }
    } catch (error) {
      throw error;
    }
  }

  async getPendingViewerRequests(masjidId) {
    try {
      const [rows] = await pool.query(`
        SELECT va.*, 
               v.nama as viewer_nama, v.email as viewer_email, v.foto_profil as viewer_foto,
               m.nama_masjid
        FROM viewer_access va
        JOIN pengguna v ON va.viewer_id = v.id
        JOIN masjid m ON va.masjid_id = m.id
        WHERE va.masjid_id = ? AND va.status = 'Pending'
      `, [masjidId]);
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  async updateViewerAccessStatus(requestId, editorId, status) {
    try {
      let expiresAt = null;
      if (status === 'Approved') {
        const date = new Date();
        date.setMonth(date.getMonth() + 6); // 6 bulan
        expiresAt = date.toISOString().slice(0, 19).replace('T', ' ');
      }
      
      const [result] = await pool.query(
        "UPDATE viewer_access SET status = ?, granted_by = ?, expires_at = ? WHERE id = ?",
        [status, editorId, expiresAt, requestId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  async getApprovedViewers(masjidId) {
    try {
      const [rows] = await pool.query(`
        SELECT va.*, 
               v.nama as viewer_nama, v.email as viewer_email, v.foto_profil as viewer_foto,
               g.nama as granter_nama,
               m.nama_masjid
        FROM viewer_access va
        JOIN pengguna v ON va.viewer_id = v.id
        JOIN pengguna g ON va.granted_by = g.id
        JOIN masjid m ON va.masjid_id = m.id
        WHERE va.masjid_id = ? AND va.status = 'Approved'
        AND (va.expires_at IS NULL OR va.expires_at > NOW())
      `, [masjidId]);
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  async removeViewerAccess(requestId) {
    try {
      const [result] = await pool.query(
        "DELETE FROM viewer_access WHERE id = ?",
        [requestId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  async hasViewerAccess(userId, masjidId) {
    try {
      const [adminCheck] = await pool.query(
        "SELECT * FROM pengguna WHERE id = ? AND peran = 'Admin'",
        [userId]
      );
      
      if (adminCheck.length > 0) {
        return true;
      }
      
      const [editorCheck] = await pool.query(
        "SELECT * FROM pengguna WHERE id = ? AND masjid_id = ? AND peran = 'Editor' AND status = 'Approved'",
        [userId, masjidId]
      );
      
      if (editorCheck.length > 0) {
        return true;
      }
      
      const [viewerCheck] = await pool.query(`
        SELECT * FROM viewer_access 
        WHERE viewer_id = ? AND masjid_id = ? AND status = 'Approved'
        AND (expires_at IS NULL OR expires_at > NOW())
      `, [userId, masjidId]);
      
      return viewerCheck.length > 0;
    } catch (error) {
      throw error;
    }
  }

  async hasEditorAccess(userId, masjidId) {
    try {
      const [adminCheck] = await pool.query(
        "SELECT * FROM pengguna WHERE id = ? AND peran = 'Admin'",
        [userId]
      );
      
      if (adminCheck.length > 0) {
        return true;
      }
      
      const [editorCheck] = await pool.query(
        "SELECT * FROM pengguna WHERE id = ? AND masjid_id = ? AND peran = 'Editor' AND status = 'Approved'",
        [userId, masjidId]
      );
      
      return editorCheck.length > 0;
    } catch (error) {
      throw error;
    }
  }

  async getAccessibleMasjids(userId) {
    try {
      const [userInfo] = await pool.query(
        "SELECT peran, masjid_id FROM pengguna WHERE id = ?",
        [userId]
      );

      if (userInfo.length === 0) {
        throw new Error("User not found");
      }

      const userRole = userInfo[0].peran;
      const userMasjidId = userInfo[0].masjid_id;

      if (userRole === 'Admin') {
        const [masjids] = await pool.query("SELECT * FROM masjid");
        return masjids;
      }

      let accessibleMasjids = [];
      
      if (userMasjidId) {
        const [ownMasjid] = await pool.query(
          "SELECT * FROM masjid WHERE id = ?",
          [userMasjidId]
        );
        
        if (ownMasjid.length > 0) {
          accessibleMasjids.push({
            ...ownMasjid[0],
            access_type: 'Editor'
          });
        }
      }

      const [viewerMasjids] = await pool.query(`
        SELECT m.*, 'Viewer' as access_type
        FROM viewer_access va
        JOIN masjid m ON va.masjid_id = m.id
        WHERE va.viewer_id = ? AND va.status = 'Approved'
        AND (va.expires_at IS NULL OR va.expires_at > NOW())
      `, [userId]);

      return [...accessibleMasjids, ...viewerMasjids];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AccessModel();