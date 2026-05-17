const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken, requireTenant } = require('../middleware/auth');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

router.use(authenticateToken);
router.use(requireTenant);

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

router.get('/list', async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { results: rows } = await query('SELECT * FROM dining_table WHERE tenant_id = ? ORDER BY table_name ASC', [tenantId]);
    res.json({ code: 200, data: rows });
  } catch (error) {
    console.error('获取桌号列表错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenant_id;
    const { results: rows } = await query('SELECT * FROM dining_table WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '桌号不存在' });
    }
    res.json({ code: 200, data: rows[0] });
  } catch (error) {
    console.error('获取桌号详情错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { table_name } = req.body;
    const tenantId = req.user.tenant_id;
    
    if (!table_name) {
      return res.status(400).json({ code: 400, message: '请填写桌号名称' });
    }

    const { results: result } = await query(
      'INSERT INTO dining_table (tenant_id, table_name, status) VALUES (?, ?, ?)',
      [tenantId, table_name, 1]
    );

    res.json({ code: 200, message: '添加成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('添加桌号错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { table_name, status } = req.body;
    const tenantId = req.user.tenant_id;
    
    const { results: existsRows } = await query('SELECT id FROM dining_table WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (existsRows.length === 0) {
      return res.status(404).json({ code: 404, message: '桌号不存在' });
    }

    await query('UPDATE dining_table SET table_name = ?, status = ? WHERE id = ?', [table_name, status, id]);
    
    res.json({ code: 200, message: '修改成功' });
  } catch (error) {
    console.error('修改桌号错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenant_id;
    
    const { results: existsRows } = await query('SELECT id FROM dining_table WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (existsRows.length === 0) {
      return res.status(404).json({ code: 404, message: '桌号不存在' });
    }

    await query('DELETE FROM dining_table WHERE id = ?', [id]);
    
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    console.error('删除桌号错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.post('/generate-qrcode', async (req, res) => {
  try {
    const { table_id } = req.body;
    const tenantId = req.user.tenant_id;
    
    const { results: rows } = await query('SELECT * FROM dining_table WHERE id = ? AND tenant_id = ?', [table_id, tenantId]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '桌号不存在' });
    }

    const table = rows[0];
    const qrContent = `https://example.com/order?tenant_id=${tenantId}&table_id=${table.id}`;
    const fileName = `qrcode_${tenantId}_${table.id}.png`;
    const filePath = path.join(uploadsDir, fileName);
    
    await QRCode.toFile(filePath, qrContent, {
      width: 200,
      margin: 2
    });

    const qrcodeUrl = `http://localhost:8001/uploads/${fileName}`;
    
    await query('UPDATE dining_table SET qrcode_url = ? WHERE id = ?', [qrcodeUrl, table_id]);
    
    res.json({ code: 200, message: '生成成功', data: { qrcode_url: qrcodeUrl } });
  } catch (error) {
    console.error('生成二维码错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.post('/batch-generate-qrcode', async (req, res) => {
  try {
    const { table_ids } = req.body;
    const tenantId = req.user.tenant_id;
    
    if (!table_ids || !Array.isArray(table_ids)) {
      return res.status(400).json({ code: 400, message: '请选择桌号' });
    }

    const results = [];
    
    for (const table_id of table_ids) {
      const { results: rows } = await query('SELECT * FROM dining_table WHERE id = ? AND tenant_id = ?', [table_id, tenantId]);
      if (rows.length === 0) continue;
      
      const table = rows[0];
      const qrContent = `https://example.com/order?tenant_id=${tenantId}&table_id=${table.id}`;
      const fileName = `qrcode_${tenantId}_${table.id}.png`;
      const filePath = path.join(uploadsDir, fileName);
      
      await QRCode.toFile(filePath, qrContent, {
        width: 200,
        margin: 2
      });

      const qrcodeUrl = `http://localhost:8001/uploads/${fileName}`;
      
      await query('UPDATE dining_table SET qrcode_url = ? WHERE id = ?', [qrcodeUrl, table_id]);
      
      results.push({ table_id, table_name: table.table_name, qrcode_url: qrcodeUrl });
    }
    
    res.json({ code: 200, message: '批量生成成功', data: results });
  } catch (error) {
    console.error('批量生成二维码错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.put('/batch-status', async (req, res) => {
  try {
    const { ids, status } = req.body;
    const tenantId = req.user.tenant_id;
    
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ code: 400, message: '请选择桌号' });
    }

    const placeholders = ids.map(() => '?').join(',');
    await query(`UPDATE dining_table SET status = ? WHERE id IN (${placeholders}) AND tenant_id = ?`, [status, ...ids, tenantId]);
    
    res.json({ code: 200, message: '操作成功' });
  } catch (error) {
    console.error('批量操作错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
