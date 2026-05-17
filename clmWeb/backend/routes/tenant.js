const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken, requireTenant } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireTenant);

router.get('/info', async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { results: rows } = await query('SELECT * FROM tenant WHERE id = ?', [tenantId]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '店铺不存在' });
    }
    res.json({ code: 200, data: rows[0] });
  } catch (error) {
    console.error('获取店铺信息错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.put('/info', async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { name, logo, tel, business_hours } = req.body;
    
    await query(
      'UPDATE tenant SET name = ?, logo = ?, tel = ?, business_hours = ? WHERE id = ?',
      [name, logo || '', tel || '', business_hours || '', tenantId]
    );
    
    res.json({ code: 200, message: '修改成功' });
  } catch (error) {
    console.error('修改店铺信息错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.put('/takeout', async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { enable_takeout, min_delivery_amount, delivery_fee, delivery_range } = req.body;
    
    await query(
      'UPDATE tenant SET enable_takeout = ?, min_delivery_amount = ?, delivery_fee = ?, delivery_range = ? WHERE id = ?',
      [enable_takeout, min_delivery_amount || 0, delivery_fee || 0, delivery_range || '', tenantId]
    );
    
    res.json({ code: 200, message: '修改成功' });
  } catch (error) {
    console.error('修改外卖配置错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.put('/payment', async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { wx_pay_params, alipay_params } = req.body;
    
    await query(
      'UPDATE tenant SET wx_pay_params = ?, alipay_params = ? WHERE id = ?',
      [wx_pay_params || '', alipay_params || '', tenantId]
    );
    
    res.json({ code: 200, message: '修改成功' });
  } catch (error) {
    console.error('修改支付配置错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.put('/printer', async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { printer_params } = req.body;
    
    await query('UPDATE tenant SET printer_params = ? WHERE id = ?', [printer_params || '', tenantId]);
    
    res.json({ code: 200, message: '修改成功' });
  } catch (error) {
    console.error('修改打印配置错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
