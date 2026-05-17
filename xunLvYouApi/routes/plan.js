const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authenticateToken = require('../middleware/auth');

router.get('/list', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.user.id;
    
    let query = 'SELECT id, name, travel_date as travelDate, people_count as peopleCount, status, scenic_ids as scenicIds, scenic_names as scenicNames, created_at as createTime FROM plans WHERE user_id = ?';
    let params = [userId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    const [plans] = await pool.query(query, params);
    
    res.json({ list: plans.map(plan => ({
      ...plan,
      scenicIds: plan.scenicIds ? JSON.parse(plan.scenicIds) : [],
      scenicNames: plan.scenicNames ? JSON.parse(plan.scenicNames) : []
    })) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const [plans] = await pool.query('SELECT * FROM plans WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (plans.length === 0) {
      return res.status(404).json({ error: '计划不存在' });
    }
    
    const plan = plans[0];
    
    const scenicIds = plan.scenic_ids ? JSON.parse(plan.scenic_ids) : [];
    let scenics = [];
    if (scenicIds.length > 0) {
      const [spots] = await pool.query('SELECT id, name, address FROM scenic_spots WHERE id IN (?)', [scenicIds]);
      scenics = spots;
    }

    res.json({
      id: plan.id,
      name: plan.name,
      travelDate: plan.travel_date,
      peopleCount: plan.people_count,
      status: plan.status,
      createTime: plan.created_at,
      scenics: scenics,
      guide: plan.guide ? JSON.parse(plan.guide) : []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { name, travelDate, peopleCount, scenicIds, guide } = req.body;
    const userId = req.user.id;
    
    const [spots] = await pool.query('SELECT name FROM scenic_spots WHERE id IN (?)', [scenicIds]);
    const scenicNames = spots.map(s => s.name);
    
    await pool.query('INSERT INTO plans (name, user_id, travel_date, people_count, scenic_ids, scenic_names, guide) VALUES (?, ?, ?, ?, ?, ?, ?)', 
      [name, userId, travelDate, peopleCount, JSON.stringify(scenicIds), JSON.stringify(scenicNames), JSON.stringify(guide)]);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/generate-guide', authenticateToken, async (req, res) => {
  try {
    const { scenicIds, travelDate, peopleCount } = req.body;
    
    const [spots] = await pool.query('SELECT name, address FROM scenic_spots WHERE id IN (?)', [scenicIds]);
    
    const guideContent = {
      content: `您的出行指南已生成！\n\n日期：${travelDate}\n人数：${peopleCount}人\n\n行程安排：\n${spots.map((s, i) => `${i + 1}. ${s.name} - ${s.address}`).join('\n')}\n\n祝您旅途愉快！`
    };
    
    res.json(guideContent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/update-status', authenticateToken, async (req, res) => {
  try {
    const { planId, status } = req.body;
    const userId = req.user.id;
    
    await pool.query('UPDATE plans SET status = ? WHERE id = ? AND user_id = ?', [status, planId, userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;