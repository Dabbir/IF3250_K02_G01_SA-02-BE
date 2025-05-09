const { pool } = require("../config/db.config");

class Publication {
  static async getAll() {
    const query = `
      SELECT p.*, 
             prog.nama_program as program_name,
             act.nama_aktivitas as activity_name
      FROM publikasi p
      LEFT JOIN program prog ON p.program_id = prog.id
      LEFT JOIN aktivitas act ON p.aktivitas_id = act.id
    `;
    const [rows] = await pool.query(query);
    return rows;
  }

  static async getById(id) {
    const query = `
      SELECT p.*, 
             prog.nama_program as program_name,
             act.nama_aktivitas as activity_name
      FROM publikasi p
      LEFT JOIN program prog ON p.program_id = prog.id
      LEFT JOIN aktivitas act ON p.aktivitas_id = act.id
      WHERE p.id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    return rows[0];
  }

  static async create(data) {
    const [result] = await pool.query('INSERT INTO publikasi SET ?', [data]);
    return result.insertId;
  }

  static async update(id, data) {
    await pool.query('UPDATE publikasi SET ? WHERE id = ?', [data, id]);
  }

  static async delete(id) {
    await pool.query('DELETE FROM publikasi WHERE id = ?', [id]);
  }

  static async getPaginated(page, limit, offset, search, sortBy, sortOrder, filters) {
    try {
      const allowedSortColumns = [
        'judul_publikasi', 
        'media_publikasi', 
        'nama_perusahaan_media', 
        'tanggal_publikasi', 
        'pr_value', 
        'tone',
        'program_name',
        'activity_name'
      ];
      
      if (!allowedSortColumns.includes(sortBy)) {
        sortBy = 'tanggal_publikasi';
      }
      
      if (!['asc', 'desc'].includes(sortOrder.toLowerCase())) {
        sortOrder = 'desc';
      }
      
      let baseQuery = `
        FROM publikasi p
        LEFT JOIN program prog ON p.program_id = prog.id
        LEFT JOIN aktivitas act ON p.aktivitas_id = act.id
        WHERE 1=1
      `;
      const queryParams = [];
      
      if (search && search.trim() !== '') {
        baseQuery += ' AND p.judul_publikasi LIKE ?';
        queryParams.push(`%${search}%`);
      }
      
      if (filters) {
        if (filters.tone && filters.tone.length > 0) {
          const placeholders = filters.tone.map(() => '?').join(',');
          baseQuery += ` AND p.tone IN (${placeholders})`;
          queryParams.push(...filters.tone);
        }
        
        if (filters.media && filters.media.length > 0) {
          const placeholders = filters.media.map(() => '?').join(',');
          baseQuery += ` AND p.media_publikasi IN (${placeholders})`;
          queryParams.push(...filters.media);
        }
        
        if (filters.program && filters.program.length > 0) {
          const placeholders = filters.program.map(() => '?').join(',');
          baseQuery += ` AND p.program_id IN (${placeholders})`;
          queryParams.push(...filters.program);
        }
        
        if (filters.activity && filters.activity.length > 0) {
          const placeholders = filters.activity.map(() => '?').join(',');
          baseQuery += ` AND p.aktivitas_id IN (${placeholders})`;
          queryParams.push(...filters.activity);
        }
        
        if (filters.dateFrom) {
          baseQuery += ' AND p.tanggal_publikasi >= ?';
          queryParams.push(filters.dateFrom);
        }
        
        if (filters.dateTo) {
          baseQuery += ' AND p.tanggal_publikasi <= ?';
          queryParams.push(filters.dateTo);
        }
        
        if (filters.prValueMin !== undefined) {
          baseQuery += ' AND p.pr_value >= ?';
          queryParams.push(filters.prValueMin);
        }
        
        if (filters.prValueMax !== undefined) {
          baseQuery += ' AND p.pr_value <= ?';
          queryParams.push(filters.prValueMax);
        }
      }
      
      const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
      const [countResult] = await pool.query(countQuery, queryParams);
      const total = countResult[0].total;

      let finalQuery = `
        SELECT p.*, 
               prog.nama_program as program_name,
               act.nama_aktivitas as activity_name
        ${baseQuery}
      `;
      
      let orderByColumn = sortBy;
      if (['judul_publikasi', 'media_publikasi', 'nama_perusahaan_media', 'tanggal_publikasi', 'pr_value', 'tone'].includes(sortBy)) {
        orderByColumn = `p.${sortBy}`;
      } else if (sortBy === 'program_name') {
        orderByColumn = 'prog.nama_program';
      } else if (sortBy === 'activity_name') {
        orderByColumn = 'act.nama_aktivitas';
      }
      
      finalQuery += ` ORDER BY ${orderByColumn} ${sortOrder} LIMIT ? OFFSET ?`;
      queryParams.push(limit, offset);
      
      const [rows] = await pool.query(finalQuery, queryParams);
      
      return {
        data: rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error in getPaginated:', error);
      throw error;
    }
  }
  
  static async getFilterOptions() {
    try {
      const mediaQuery = `SELECT DISTINCT media_publikasi FROM publikasi WHERE media_publikasi IS NOT NULL`;
      const programQuery = `SELECT id, nama_program FROM program ORDER BY nama_program`;
      const activityQuery = `SELECT id, nama_aktivitas FROM aktivitas ORDER BY nama_aktivitas`;
      
      const [mediaRows] = await pool.query(mediaQuery);
      const [programRows] = await pool.query(programQuery);
      const [activityRows] = await pool.query(activityQuery);
      
      return {
        media: mediaRows.map(row => row.media_publikasi),
        programs: programRows,
        activities: activityRows,
        tones: ['Positif', 'Netral', 'Negatif']
      };
    } catch (error) {
      console.error('Error in getFilterOptions:', error);
      throw error;
    }
  }
}

module.exports = Publication;