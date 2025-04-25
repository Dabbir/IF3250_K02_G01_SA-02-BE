const { pool } = require("../config/db.config");

class Publikasi {
  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM publikasi');
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM publikasi WHERE id = ?', [id]);
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

  static async getPaginated(page, limit, offset, search, sortBy, sortOrder, toneFilters) {
    try {
      const allowedSortColumns = [
        'judul_publikasi', 
        'media_publikasi', 
        'nama_perusahaan_media', 
        'tanggal_publikasi', 
        'pr_value', 
        'tone'
      ];
      
      if (!allowedSortColumns.includes(sortBy)) {
        sortBy = 'tanggal_publikasi';
      }
      
      if (!['asc', 'desc'].includes(sortOrder.toLowerCase())) {
        sortOrder = 'desc';
      }
      
      let query = 'SELECT * FROM publikasi WHERE 1=1';
      const queryParams = [];
      
      if (search && search.trim() !== '') {
        query += ' AND judul_publikasi LIKE ?';
        queryParams.push(`%${search}%`);
      }
      
      if (toneFilters && toneFilters.length > 0) {
        const placeholders = toneFilters.map(() => '?').join(',');
        query += ` AND tone IN (${placeholders})`;
        queryParams.push(...toneFilters);
      }
      
      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
      const [countResult] = await pool.query(countQuery, queryParams);
      const total = countResult[0].total;

      query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
      queryParams.push(limit, offset);
      
      const [rows] = await pool.query(query, queryParams);
      
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
}

module.exports = Publikasi;